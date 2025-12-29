/**
 * Vocabulary Service
 * Manages word favorites, local cache, and sync operations
 * 
 * Requirements: 3.1, 3.2, 3.3, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { browser } from 'wxt/browser';
import { authService } from '../auth/AuthService';
import { offlineQueueManager } from './OfflineQueueManager';
import type {
  FavoriteWord,
  FavoriteWordInput,
  FavoriteWordSerialized,
  SyncResult,
  VocabularyStorageSchema,
  VocabularyError,
  VocabularyErrorCode,
  VocabularyEventData,
  VocabularyEventListener,
  SyncConflict,
  SyncDirection,
} from './types';
import { VocabularyEventType, DEFAULT_VOCABULARY_STORAGE } from './types';

// Storage keys
const VOCABULARY_STORAGE_KEY = 'vocabulary_data';

// Default API endpoint
const DEFAULT_API_ENDPOINT = 'http://localhost:3001';

/**
 * Helper function to make API requests through background script
 * This bypasses CORS restrictions for content scripts
 */
async function backgroundFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Try to send through background script
    const response = await browser.runtime.sendMessage({
      type: 'api-request',
      data: {
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body as string | undefined,
        timeout: 30000,
      },
    });

    // Convert background response to Response-like object
    if (response && typeof response === 'object') {
      const { success, data, error } = response;
      
      if (success) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => data,
          text: async () => JSON.stringify(data),
        } as Response;
      } else {
        return {
          ok: false,
          status: error?.status || 500,
          statusText: error?.statusText || error?.message || 'Error',
          json: async () => ({ success: false, error }),
          text: async () => JSON.stringify({ success: false, error }),
        } as Response;
      }
    }
    
    throw new Error('Invalid response from background');
  } catch (error) {
    // Fallback to direct fetch (for options page, popup, etc.)
    console.log('[VocabularyService] Background fetch failed, trying direct fetch:', error);
    return fetch(url, options);
  }
}

/**
 * VocabularyService class
 * Singleton service for managing word favorites
 */
export class VocabularyService {
  private static instance: VocabularyService;
  
  private apiEndpoint: string;
  private eventListeners: Map<VocabularyEventType, VocabularyEventListener[]> = new Map();
  private cache: VocabularyStorageSchema | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.apiEndpoint = DEFAULT_API_ENDPOINT;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): VocabularyService {
    if (!VocabularyService.instance) {
      VocabularyService.instance = new VocabularyService();
    }
    return VocabularyService.instance;
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await this.loadCache();
    
    // Initialize offline queue manager
    await offlineQueueManager.initialize();
    
    this.isInitialized = true;
    console.log('[VocabularyService] Initialized');
  }

  /**
   * Configure API endpoint
   */
  public setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint.replace(/\/$/, '');
  }

  // ==================== Event Management ====================

  /**
   * Add event listener
   */
  public addEventListener(
    eventType: VocabularyEventType,
    listener: VocabularyEventListener,
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(
    eventType: VocabularyEventType,
    listener: VocabularyEventListener,
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(
    type: VocabularyEventType,
    word?: FavoriteWord,
    syncResult?: SyncResult,
    error?: VocabularyError,
  ): void {
    const event: VocabularyEventData = {
      type,
      timestamp: Date.now(),
      word,
      syncResult,
      error,
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.error('[VocabularyService] Event listener error:', e);
        }
      });
    }
  }

  // ==================== Core Methods ====================

  /**
   * Favorite a word
   * Requirements: 3.1, 3.2, 9.3
   */
  public async favoriteWord(wordData: FavoriteWordInput): Promise<FavoriteWord> {
    await this.ensureInitialized();

    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw this.createError('VOCAB_AUTH_REQUIRED', 'Please log in to favorite words');
    }

    // Check if word is already favorited
    const existingWord = await this.findFavoriteByWord(wordData.word);
    if (existingWord) {
      // Word already favorited, return existing
      return existingWord;
    }

    // Extract domain from sourceUrl for auto-categorization (Requirement 9.3)
    const initialTags: string[] = [];
    if (wordData.sourceUrl) {
      const domain = this.extractDomain(wordData.sourceUrl);
      if (domain) {
        initialTags.push(`source:${domain}`);
      }
    }

    // Create new favorite word
    const favoriteWord: FavoriteWord = {
      ...wordData,
      id: this.generateId(),
      userId: user.id,
      favoritedAt: new Date(),
      tags: initialTags,
      reviewCount: 0,
      masteryLevel: 'new',
    };

    // Add to local cache
    await this.addToCache(favoriteWord);

    // Emit event
    this.emitEvent(VocabularyEventType.WORD_FAVORITED, favoriteWord);

    // Sync to server (non-blocking)
    this.syncWordToServer(favoriteWord).catch((error) => {
      console.error('[VocabularyService] Failed to sync word to server:', error);
    });

    return favoriteWord;
  }

  /**
   * Unfavorite a word
   * Requirements: 3.3
   */
  public async unfavoriteWord(wordId: string): Promise<void> {
    await this.ensureInitialized();

    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw this.createError('VOCAB_AUTH_REQUIRED', 'Please log in to manage favorites');
    }

    // Find the word
    const word = await this.findFavoriteById(wordId);
    if (!word) {
      throw this.createError('VOCAB_NOT_FOUND', 'Word not found in favorites');
    }

    // Remove from local cache
    await this.removeFromCache(wordId);

    // Emit event
    this.emitEvent(VocabularyEventType.WORD_UNFAVORITED, word);

    // Sync deletion to server (non-blocking)
    this.deleteWordFromServer(wordId).catch((error) => {
      console.error('[VocabularyService] Failed to delete word from server:', error);
    });
  }

  /**
   * Check if a word is favorited
   * Requirements: 3.2
   */
  public async isFavorited(word: string): Promise<boolean> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    return word in cache.favoriteIndex;
  }

  /**
   * Get favorite word by word text
   */
  public async getFavoriteByWord(word: string): Promise<FavoriteWord | null> {
    await this.ensureInitialized();
    return this.findFavoriteByWord(word);
  }

  /**
   * Get all favorites from local cache
   */
  public async getFavorites(): Promise<FavoriteWord[]> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    return cache.favorites.words.map(this.deserializeFavoriteWord);
  }

  /**
   * Get favorites count
   */
  public async getFavoritesCount(): Promise<number> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    return cache.favorites.words.length;
  }

  /**
   * Add tag to a word
   * Requirements: 9.1
   */
  public async addTag(wordId: string, tag: string): Promise<void> {
    await this.ensureInitialized();

    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw this.createError('VOCAB_AUTH_REQUIRED', 'Please log in to manage tags');
    }

    const cache = await this.getCache();
    const wordIndex = cache.favorites.words.findIndex((w) => w.id === wordId);
    
    if (wordIndex === -1) {
      throw this.createError('VOCAB_NOT_FOUND', 'Word not found');
    }

    const word = cache.favorites.words[wordIndex];
    const normalizedTag = tag.trim().toLowerCase();
    
    if (!normalizedTag) {
      throw this.createError('VOCAB_SYNC_FAILED', 'Tag cannot be empty');
    }

    if (!word.tags.includes(normalizedTag)) {
      word.tags.push(normalizedTag);
      await this.saveCache(cache);
      
      // Emit cache updated event
      this.emitEvent(VocabularyEventType.CACHE_UPDATED);
      
      // Sync to server (non-blocking)
      this.syncTagsToServer(wordId, word.tags).catch((error) => {
        console.error('[VocabularyService] Failed to sync tags to server:', error);
      });
    }
  }

  /**
   * Remove tag from a word
   * Requirements: 9.1
   */
  public async removeTag(wordId: string, tag: string): Promise<void> {
    await this.ensureInitialized();

    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw this.createError('VOCAB_AUTH_REQUIRED', 'Please log in to manage tags');
    }

    const cache = await this.getCache();
    const wordIndex = cache.favorites.words.findIndex((w) => w.id === wordId);
    
    if (wordIndex === -1) {
      throw this.createError('VOCAB_NOT_FOUND', 'Word not found');
    }

    const word = cache.favorites.words[wordIndex];
    const normalizedTag = tag.trim().toLowerCase();
    const tagIndex = word.tags.indexOf(normalizedTag);
    
    if (tagIndex > -1) {
      word.tags.splice(tagIndex, 1);
      await this.saveCache(cache);
      
      // Emit cache updated event
      this.emitEvent(VocabularyEventType.CACHE_UPDATED);
      
      // Sync to server (non-blocking)
      this.syncTagsToServer(wordId, word.tags).catch((error) => {
        console.error('[VocabularyService] Failed to sync tags to server:', error);
      });
    }
  }

  /**
   * Get all unique tags from user's vocabulary
   * Requirements: 9.1, 9.2
   */
  public async getAllTags(): Promise<string[]> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    const tagSet = new Set<string>();
    
    for (const word of cache.favorites.words) {
      for (const tag of word.tags) {
        tagSet.add(tag);
      }
    }
    
    return Array.from(tagSet).sort();
  }

  /**
   * Get words by tag
   * Requirements: 9.2
   */
  public async getWordsByTag(tag: string): Promise<FavoriteWord[]> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    const normalizedTag = tag.trim().toLowerCase();
    
    return cache.favorites.words
      .filter((w) => w.tags.includes(normalizedTag))
      .map(this.deserializeFavoriteWord);
  }

  /**
   * Update all tags for a word
   * Requirements: 9.1
   */
  public async updateTags(wordId: string, tags: string[]): Promise<void> {
    await this.ensureInitialized();

    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      throw this.createError('VOCAB_AUTH_REQUIRED', 'Please log in to manage tags');
    }

    const cache = await this.getCache();
    const wordIndex = cache.favorites.words.findIndex((w) => w.id === wordId);
    
    if (wordIndex === -1) {
      throw this.createError('VOCAB_NOT_FOUND', 'Word not found');
    }

    // Normalize and deduplicate tags
    const normalizedTags = [...new Set(
      tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)
    )];

    cache.favorites.words[wordIndex].tags = normalizedTags;
    await this.saveCache(cache);
    
    // Emit cache updated event
    this.emitEvent(VocabularyEventType.CACHE_UPDATED);
    
    // Sync to server (non-blocking)
    this.syncTagsToServer(wordId, normalizedTags).catch((error) => {
      console.error('[VocabularyService] Failed to sync tags to server:', error);
    });
  }

  /**
   * Sync all local changes to server
   * Requirements: 7.1, 7.2, 7.4, 7.5
   * Implements last-write-wins conflict resolution
   */
  public async syncToServer(): Promise<SyncResult> {
    this.emitEvent(VocabularyEventType.SYNC_STARTED);

    try {
      const token = await authService.getAccessToken();
      if (!token) {
        const error = this.createError('VOCAB_AUTH_REQUIRED', 'Not authenticated');
        this.emitEvent(VocabularyEventType.SYNC_FAILED, undefined, undefined, error);
        return { success: false, syncedCount: 0, failedCount: 0, errors: [error.message] };
      }

      // Check if online
      if (!offlineQueueManager.getIsOnline()) {
        const error = this.createError('VOCAB_NETWORK_ERROR', 'Network unavailable');
        this.emitEvent(VocabularyEventType.SYNC_FAILED, undefined, undefined, error);
        return { success: false, syncedCount: 0, failedCount: 0, errors: [error.message] };
      }

      const cache = await this.getCache();
      const localWords = cache.favorites.words.map(this.deserializeFavoriteWord);
      const lastSyncAt = cache.favorites.lastSyncAt;

      // Prepare sync payload with timestamps for conflict resolution
      const syncPayload = {
        words: localWords.map(w => ({
          ...w,
          favoritedAt: w.favoritedAt.toISOString(),
          lastReviewedAt: w.lastReviewedAt?.toISOString(),
        })),
        lastSyncAt: lastSyncAt ? new Date(lastSyncAt).toISOString() : undefined,
      };

      const response = await backgroundFetch(`${this.apiEndpoint}/api/vocabulary/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(syncPayload),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update last sync time
      cache.favorites.lastSyncAt = Date.now();
      cache.favorites.version++;
      await this.saveCache(cache);

      const syncResult: SyncResult = {
        success: true,
        syncedCount: result.data?.synced || localWords.length,
        failedCount: result.data?.failed || 0,
        conflicts: result.data?.conflicts || [],
      };

      this.emitEvent(VocabularyEventType.SYNC_COMPLETED, undefined, syncResult);
      return syncResult;
    } catch (error) {
      const vocabError = this.createError(
        'VOCAB_SYNC_FAILED',
        error instanceof Error ? error.message : 'Sync failed',
      );
      this.emitEvent(VocabularyEventType.SYNC_FAILED, undefined, undefined, vocabError);
      return {
        success: false,
        syncedCount: 0,
        failedCount: 1,
        errors: [vocabError.message],
      };
    }
  }

  /**
   * Pull favorites from server and merge with local cache
   * Requirements: 7.1, 7.4, 7.5
   * Implements last-write-wins conflict resolution
   */
  public async pullFromServer(): Promise<FavoriteWord[]> {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        throw this.createError('VOCAB_AUTH_REQUIRED', 'Not authenticated');
      }

      // Check if online
      if (!offlineQueueManager.getIsOnline()) {
        throw this.createError('VOCAB_NETWORK_ERROR', 'Network unavailable');
      }

      const response = await backgroundFetch(`${this.apiEndpoint}/api/vocabulary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vocabulary: ${response.statusText}`);
      }

      const data = await response.json();
      const serverWords: FavoriteWord[] = (data.data || []).map((w: any) => ({
        ...w,
        favoritedAt: new Date(w.favoritedAt),
        lastReviewedAt: w.lastReviewedAt ? new Date(w.lastReviewedAt) : undefined,
      }));

      // Get local cache for conflict resolution
      const cache = await this.getCache();
      const localWords = cache.favorites.words.map(this.deserializeFavoriteWord);

      // Merge with conflict resolution (last-write-wins)
      const mergedWords = this.mergeWithConflictResolution(localWords, serverWords);

      // Update local cache with merged data
      cache.favorites.words = mergedWords.map(this.serializeFavoriteWord);
      cache.favorites.lastSyncAt = Date.now();
      cache.favorites.version++;
      cache.favoriteIndex = this.buildFavoriteIndex(mergedWords);
      await this.saveCache(cache);

      this.emitEvent(VocabularyEventType.CACHE_UPDATED);
      return mergedWords;
    } catch (error) {
      console.error('[VocabularyService] Failed to pull from server:', error);
      throw error;
    }
  }

  /**
   * Full bidirectional sync
   * Requirements: 7.1, 7.2, 7.4, 7.5
   * Pulls from server, merges with local, then pushes changes back
   */
  public async fullSync(): Promise<SyncResult> {
    this.emitEvent(VocabularyEventType.SYNC_STARTED);

    try {
      const token = await authService.getAccessToken();
      if (!token) {
        const error = this.createError('VOCAB_AUTH_REQUIRED', 'Not authenticated');
        this.emitEvent(VocabularyEventType.SYNC_FAILED, undefined, undefined, error);
        return { success: false, syncedCount: 0, failedCount: 0, errors: [error.message] };
      }

      // Check if online
      if (!offlineQueueManager.getIsOnline()) {
        const error = this.createError('VOCAB_NETWORK_ERROR', 'Network unavailable');
        this.emitEvent(VocabularyEventType.SYNC_FAILED, undefined, undefined, error);
        return { success: false, syncedCount: 0, failedCount: 0, errors: [error.message] };
      }

      // First, process any pending offline operations
      await offlineQueueManager.processQueue();

      // Pull from server and merge
      const mergedWords = await this.pullFromServer();

      // Push merged data back to server
      const pushResult = await this.syncToServer();

      const syncResult: SyncResult = {
        success: pushResult.success,
        syncedCount: mergedWords.length,
        failedCount: pushResult.failedCount,
        errors: pushResult.errors,
        conflicts: pushResult.conflicts,
      };

      this.emitEvent(VocabularyEventType.SYNC_COMPLETED, undefined, syncResult);
      return syncResult;
    } catch (error) {
      const vocabError = this.createError(
        'VOCAB_SYNC_FAILED',
        error instanceof Error ? error.message : 'Full sync failed',
      );
      this.emitEvent(VocabularyEventType.SYNC_FAILED, undefined, undefined, vocabError);
      return {
        success: false,
        syncedCount: 0,
        failedCount: 1,
        errors: [vocabError.message],
      };
    }
  }

  /**
   * Merge local and server words with last-write-wins conflict resolution
   * Requirements: 7.4
   */
  private mergeWithConflictResolution(
    localWords: FavoriteWord[],
    serverWords: FavoriteWord[],
  ): FavoriteWord[] {
    const mergedMap = new Map<string, FavoriteWord>();
    const conflicts: SyncConflict[] = [];

    // Add all server words to the map
    for (const serverWord of serverWords) {
      mergedMap.set(serverWord.word, serverWord);
    }

    // Process local words and resolve conflicts
    for (const localWord of localWords) {
      const serverWord = mergedMap.get(localWord.word);

      if (!serverWord) {
        // Word only exists locally, add it
        mergedMap.set(localWord.word, localWord);
      } else {
        // Word exists in both - apply last-write-wins
        const localTime = localWord.favoritedAt.getTime();
        const serverTime = serverWord.favoritedAt.getTime();

        // Compare timestamps - use the most recently modified version
        // For words, we compare favoritedAt as the primary timestamp
        // If lastReviewedAt exists and is more recent, use that for comparison
        const localLatest = Math.max(
          localTime,
          localWord.lastReviewedAt?.getTime() || 0,
        );
        const serverLatest = Math.max(
          serverTime,
          serverWord.lastReviewedAt?.getTime() || 0,
        );

        if (localLatest > serverLatest) {
          // Local version is newer - keep local
          mergedMap.set(localWord.word, localWord);
          conflicts.push({
            word: localWord.word,
            localVersion: localWord,
            serverVersion: serverWord,
            resolution: 'local',
            resolvedAt: new Date(),
          });
        } else if (serverLatest > localLatest) {
          // Server version is newer - keep server (already in map)
          conflicts.push({
            word: localWord.word,
            localVersion: localWord,
            serverVersion: serverWord,
            resolution: 'server',
            resolvedAt: new Date(),
          });
        }
        // If timestamps are equal, server version wins (already in map)
      }
    }

    // Log conflicts for debugging
    if (conflicts.length > 0) {
      console.log(`[VocabularyService] Resolved ${conflicts.length} sync conflicts`);
    }

    return Array.from(mergedMap.values());
  }

  /**
   * Clear local cache
   */
  public async clearCache(): Promise<void> {
    this.cache = { ...DEFAULT_VOCABULARY_STORAGE };
    await this.saveCache(this.cache);
    this.emitEvent(VocabularyEventType.CACHE_UPDATED);
  }

  /**
   * Get last sync timestamp
   * Requirements: 7.5
   */
  public async getLastSyncAt(): Promise<Date | null> {
    const cache = await this.getCache();
    return cache.favorites.lastSyncAt ? new Date(cache.favorites.lastSyncAt) : null;
  }

  /**
   * Check if sync is needed (local changes since last sync)
   * Requirements: 7.2
   */
  public async isSyncNeeded(): Promise<boolean> {
    const cache = await this.getCache();
    const lastSyncAt = cache.favorites.lastSyncAt;
    
    if (!lastSyncAt) {
      // Never synced, sync needed if there are words
      return cache.favorites.words.length > 0;
    }

    // Check if any words were modified after last sync
    for (const word of cache.favorites.words) {
      const favoritedAt = new Date(word.favoritedAt).getTime();
      const lastReviewedAt = word.lastReviewedAt 
        ? new Date(word.lastReviewedAt).getTime() 
        : 0;
      
      if (favoritedAt > lastSyncAt || lastReviewedAt > lastSyncAt) {
        return true;
      }
    }

    // Check if there are pending offline operations
    const queueStatus = await offlineQueueManager.getQueueStatus();
    return queueStatus.pendingCount > 0;
  }

  /**
   * Sync on login - called when user logs in on a new device
   * Requirements: 7.1, 7.5
   */
  public async syncOnLogin(): Promise<SyncResult> {
    console.log('[VocabularyService] Syncing on login...');
    
    // Pull from server first to get all user's words
    // Then merge with any local words (if any)
    return this.fullSync();
  }

  // ==================== Private Helper Methods ====================

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Load cache from storage
   */
  private async loadCache(): Promise<void> {
    try {
      const result = await browser.storage.local.get(VOCABULARY_STORAGE_KEY);
      const data = result[VOCABULARY_STORAGE_KEY];
      
      if (data) {
        this.cache = JSON.parse(data) as VocabularyStorageSchema;
      } else {
        this.cache = { ...DEFAULT_VOCABULARY_STORAGE };
      }
    } catch (error) {
      console.error('[VocabularyService] Failed to load cache:', error);
      this.cache = { ...DEFAULT_VOCABULARY_STORAGE };
    }
  }

  /**
   * Get cache (load if needed)
   */
  private async getCache(): Promise<VocabularyStorageSchema> {
    if (!this.cache) {
      await this.loadCache();
    }
    return this.cache!;
  }

  /**
   * Save cache to storage
   */
  private async saveCache(cache: VocabularyStorageSchema): Promise<void> {
    this.cache = cache;
    await browser.storage.local.set({
      [VOCABULARY_STORAGE_KEY]: JSON.stringify(cache),
    });
  }

  /**
   * Add word to local cache
   */
  private async addToCache(word: FavoriteWord): Promise<void> {
    const cache = await this.getCache();
    
    // Add to words array
    cache.favorites.words.push(this.serializeFavoriteWord(word));
    
    // Update index
    cache.favoriteIndex[word.word] = word.id;
    
    await this.saveCache(cache);
    this.emitEvent(VocabularyEventType.CACHE_UPDATED);
  }

  /**
   * Remove word from local cache
   */
  private async removeFromCache(wordId: string): Promise<void> {
    const cache = await this.getCache();
    
    // Find and remove from words array
    const wordIndex = cache.favorites.words.findIndex((w) => w.id === wordId);
    if (wordIndex > -1) {
      const word = cache.favorites.words[wordIndex];
      cache.favorites.words.splice(wordIndex, 1);
      
      // Remove from index
      delete cache.favoriteIndex[word.word];
    }
    
    await this.saveCache(cache);
    this.emitEvent(VocabularyEventType.CACHE_UPDATED);
  }

  /**
   * Find favorite word by word text
   */
  private async findFavoriteByWord(word: string): Promise<FavoriteWord | null> {
    const cache = await this.getCache();
    const wordId = cache.favoriteIndex[word];
    
    if (!wordId) return null;
    
    const serialized = cache.favorites.words.find((w) => w.id === wordId);
    return serialized ? this.deserializeFavoriteWord(serialized) : null;
  }

  /**
   * Find favorite word by ID
   */
  private async findFavoriteById(wordId: string): Promise<FavoriteWord | null> {
    const cache = await this.getCache();
    const serialized = cache.favorites.words.find((w) => w.id === wordId);
    return serialized ? this.deserializeFavoriteWord(serialized) : null;
  }

  /**
   * Sync single word to server
   * Requirements: 7.3 - Queue operation if offline
   */
  private async syncWordToServer(word: FavoriteWord): Promise<void> {
    // Check if online
    if (!offlineQueueManager.getIsOnline()) {
      // Queue for later sync
      await offlineQueueManager.enqueue({
        type: 'favorite',
        payload: word,
      });
      console.log('[VocabularyService] Offline - queued favorite operation');
      return;
    }

    const token = await authService.getAccessToken();
    if (!token) {
      console.log('[VocabularyService] No token - cannot sync to server');
      return;
    }

    try {
      const response = await backgroundFetch(`${this.apiEndpoint}/api/vocabulary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          word: word.word,
          originalText: word.originalText,
          pronunciation: word.pronunciation,
          meanings: word.meanings,
          exampleSentences: word.exampleSentences,
          sourceUrl: word.sourceUrl,
          context: word.context,
          tags: word.tags,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[VocabularyService] Server sync failed:', response.status, errorData);
        // Queue for later if server error
        if (response.status >= 500) {
          await offlineQueueManager.enqueue({
            type: 'favorite',
            payload: word,
          });
        }
      } else {
        console.log('[VocabularyService] Word synced to server successfully');
      }
    } catch (error) {
      // Network error - queue for later
      await offlineQueueManager.enqueue({
        type: 'favorite',
        payload: word,
      });
      console.log('[VocabularyService] Network error - queued favorite operation', error);
    }
  }

  /**
   * Delete word from server
   * Requirements: 7.3 - Queue operation if offline
   */
  private async deleteWordFromServer(wordId: string): Promise<void> {
    // Check if online
    if (!offlineQueueManager.getIsOnline()) {
      // Queue for later sync
      await offlineQueueManager.enqueue({
        type: 'unfavorite',
        payload: { wordId },
      });
      console.log('[VocabularyService] Offline - queued unfavorite operation');
      return;
    }

    const token = await authService.getAccessToken();
    if (!token) return;

    try {
      await backgroundFetch(`${this.apiEndpoint}/api/vocabulary/${wordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Network error - queue for later
      await offlineQueueManager.enqueue({
        type: 'unfavorite',
        payload: { wordId },
      });
      console.log('[VocabularyService] Network error - queued unfavorite operation');
    }
  }

  /**
   * Sync tags to server
   * Requirements: 9.1 - Queue operation if offline
   */
  private async syncTagsToServer(wordId: string, tags: string[]): Promise<void> {
    // Check if online
    if (!offlineQueueManager.getIsOnline()) {
      // Queue for later sync
      await offlineQueueManager.enqueue({
        type: 'addTag',
        payload: { wordId, tags },
      });
      console.log('[VocabularyService] Offline - queued tag update operation');
      return;
    }

    const token = await authService.getAccessToken();
    if (!token) return;

    try {
      await backgroundFetch(`${this.apiEndpoint}/api/vocabulary/${wordId}/tags`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tags }),
      });
    } catch (error) {
      // Network error - queue for later
      await offlineQueueManager.enqueue({
        type: 'addTag',
        payload: { wordId, tags },
      });
      console.log('[VocabularyService] Network error - queued tag update operation');
    }
  }

  /**
   * Serialize FavoriteWord for storage
   */
  private serializeFavoriteWord(word: FavoriteWord): FavoriteWordSerialized {
    return {
      ...word,
      favoritedAt: word.favoritedAt.toISOString(),
      lastReviewedAt: word.lastReviewedAt?.toISOString(),
    };
  }

  /**
   * Deserialize FavoriteWord from storage
   */
  private deserializeFavoriteWord(serialized: FavoriteWordSerialized): FavoriteWord {
    return {
      ...serialized,
      favoritedAt: new Date(serialized.favoritedAt),
      lastReviewedAt: serialized.lastReviewedAt ? new Date(serialized.lastReviewedAt) : undefined,
    };
  }

  /**
   * Build favorite index from words array
   */
  private buildFavoriteIndex(words: FavoriteWord[]): Record<string, string> {
    const index: Record<string, string> = {};
    for (const word of words) {
      index[word.word] = word.id;
    }
    return index;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `word_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create vocabulary error
   */
  private createError(code: VocabularyErrorCode, message: string): VocabularyError {
    return { code, message };
  }

  /**
   * Extract domain from URL for auto-categorization
   * Requirements: 9.3
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Get the hostname and remove 'www.' prefix if present
      let domain = urlObj.hostname.toLowerCase();
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      return domain;
    } catch {
      // Invalid URL, return null
      return null;
    }
  }

  /**
   * Get domain from a word's sourceUrl
   * Requirements: 9.3
   */
  public getDomainFromWord(word: FavoriteWord): string | null {
    if (!word.sourceUrl) return null;
    return this.extractDomain(word.sourceUrl);
  }

  /**
   * Get all unique domains from user's vocabulary
   * Requirements: 9.3
   */
  public async getAllDomains(): Promise<string[]> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    const domainSet = new Set<string>();
    
    for (const word of cache.favorites.words) {
      if (word.sourceUrl) {
        const domain = this.extractDomain(word.sourceUrl);
        if (domain) {
          domainSet.add(domain);
        }
      }
    }
    
    return Array.from(domainSet).sort();
  }

  /**
   * Get words by domain
   * Requirements: 9.3
   */
  public async getWordsByDomain(domain: string): Promise<FavoriteWord[]> {
    await this.ensureInitialized();
    
    const cache = await this.getCache();
    const normalizedDomain = domain.toLowerCase();
    
    return cache.favorites.words
      .filter((w) => {
        if (!w.sourceUrl) return false;
        const wordDomain = this.extractDomain(w.sourceUrl);
        return wordDomain === normalizedDomain;
      })
      .map(this.deserializeFavoriteWord);
  }
}

// Export singleton instance
export const vocabularyService = VocabularyService.getInstance();

export default VocabularyService;
