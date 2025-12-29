/**
 * Vocabulary module type definitions
 * Contains interfaces for word favorites, sync, and offline queue
 */

import type { Pronunciation, Meaning, ExampleSentence } from '../wordPopup/types';

// Re-export types from wordPopup for convenience
export type { Pronunciation, Meaning, ExampleSentence };

// Mastery level for spaced repetition
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

// Input data for favoriting a word
export interface FavoriteWordInput {
  word: string;
  originalText: string;
  pronunciation: Pronunciation;
  meanings: Meaning[];
  exampleSentences: ExampleSentence[];
  sourceUrl: string;
  context?: string;
}

// Complete favorite word record
export interface FavoriteWord extends FavoriteWordInput {
  id: string;
  userId: string;
  favoritedAt: Date;
  tags: string[];
  reviewCount: number;
  lastReviewedAt?: Date;
  masteryLevel: MasteryLevel;
}

// Serialized version for storage (dates as ISO strings)
export interface FavoriteWordSerialized extends Omit<FavoriteWord, 'favoritedAt' | 'lastReviewedAt'> {
  favoritedAt: string;
  lastReviewedAt?: string;
}

// Sync result from server operations
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors?: string[];
  conflicts?: SyncConflict[];
}

// Sync conflict information
export interface SyncConflict {
  word: string;
  localVersion: FavoriteWord;
  serverVersion: FavoriteWord;
  resolution: 'local' | 'server';
  resolvedAt: Date;
}

// Sync direction
export type SyncDirection = 'push' | 'pull' | 'bidirectional';

// Queued operation types
export type QueuedOperationType = 
  | 'favorite' 
  | 'unfavorite' 
  | 'addTag' 
  | 'removeTag' 
  | 'updateReview';

// Queued operation for offline sync
export interface QueuedOperation {
  id: string;
  type: QueuedOperationType;
  payload: any;
  timestamp: Date;
  retryCount: number;
}

// Serialized queued operation for storage
export interface QueuedOperationSerialized extends Omit<QueuedOperation, 'timestamp'> {
  timestamp: string;
}

// Queue status
export interface QueueStatus {
  pendingCount: number;
  failedCount: number;
  lastSyncAt?: Date;
}

// Local storage schema for vocabulary
export interface VocabularyStorageSchema {
  // Cached favorite words
  favorites: {
    words: FavoriteWordSerialized[];
    lastSyncAt: number;
    version: number;
  };
  // Offline operation queue
  offlineQueue: QueuedOperationSerialized[];
  // Quick lookup index: word -> wordId
  favoriteIndex: Record<string, string>;
}

// Vocabulary service error codes
export type VocabularyErrorCode =
  | 'VOCAB_SYNC_FAILED'
  | 'VOCAB_DUPLICATE'
  | 'VOCAB_NOT_FOUND'
  | 'VOCAB_QUOTA_EXCEEDED'
  | 'VOCAB_NETWORK_ERROR'
  | 'VOCAB_AUTH_REQUIRED';

// Vocabulary service error
export interface VocabularyError {
  code: VocabularyErrorCode;
  message: string;
  details?: any;
}

// Vocabulary event types
export enum VocabularyEventType {
  WORD_FAVORITED = 'vocabulary:word_favorited',
  WORD_UNFAVORITED = 'vocabulary:word_unfavorited',
  SYNC_STARTED = 'vocabulary:sync_started',
  SYNC_COMPLETED = 'vocabulary:sync_completed',
  SYNC_FAILED = 'vocabulary:sync_failed',
  CACHE_UPDATED = 'vocabulary:cache_updated',
}

// Vocabulary event data
export interface VocabularyEventData {
  type: VocabularyEventType;
  timestamp: number;
  word?: FavoriteWord;
  syncResult?: SyncResult;
  error?: VocabularyError;
}

// Vocabulary event listener
export type VocabularyEventListener = (event: VocabularyEventData) => void;

// Default storage values
export const DEFAULT_VOCABULARY_STORAGE: VocabularyStorageSchema = {
  favorites: {
    words: [],
    lastSyncAt: 0,
    version: 1,
  },
  offlineQueue: [],
  favoriteIndex: {},
};
