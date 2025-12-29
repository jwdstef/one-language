/**
 * Word Popup Service
 * Integrates WordPopupManager with translated word click events
 * 
 * Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4
 */

import { WordPopupManager } from './WordPopupManager';
import type { WordData, PopupEventHandler, PopupEventType, Meaning, MorphologyAnalysis } from './types';
import { WORD_POPUP_STYLES } from './WordPopupTemplate';
import { vocabularyService } from '../vocabulary/VocabularyService';
import { authService } from '../auth/AuthService';
import type { FavoriteWordInput } from '../vocabulary/types';
import { DictionaryApiProvider } from '../pronunciation/phonetic/DictionaryApiProvider';
import { StorageService } from '../core/storage';
import { UniversalApiService } from '../api/services/UniversalApiService';

// CSS selector for translated words
const TRANSLATED_WORD_SELECTOR = '.wxt-translation-term';

// CSS class for interactive translated words
const INTERACTIVE_CLASS = 'wxt-translation-term--interactive';

/**
 * WordPopupService class
 * Singleton service that manages word popup integration with content
 */
export class WordPopupService {
  private static instance: WordPopupService;
  
  private popupManager: WordPopupManager;
  private isInitialized: boolean = false;
  private styleElement: HTMLStyleElement | null = null;
  private eventHandler: PopupEventHandler | null = null;
  
  // Dictionary API provider for phonetics and meanings
  private dictionaryProvider: DictionaryApiProvider;
  
  // Universal API service for AI calls
  private universalApi: UniversalApiService;
  
  // Storage service for API config
  private storageService: StorageService;
  
  // Bound event handler for cleanup
  private boundHandleWordClick: (e: Event) => void;

  private constructor() {
    this.popupManager = WordPopupManager.getInstance();
    this.boundHandleWordClick = this.handleWordClick.bind(this);
    this.dictionaryProvider = new DictionaryApiProvider();
    this.storageService = StorageService.getInstance();
    this.universalApi = UniversalApiService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WordPopupService {
    if (!WordPopupService.instance) {
      WordPopupService.instance = new WordPopupService();
    }
    return WordPopupService.instance;
  }

  /**
   * Initialize the service
   * Sets up click handlers and injects styles
   */
  public initialize(): void {
    if (this.isInitialized) return;
    
    // Inject popup styles
    this.injectStyles();
    
    // Set up event delegation for translated words
    this.setupEventDelegation();
    
    // Set up popup event handler
    this.popupManager.setEventHandler(this.handlePopupEvent.bind(this));
    
    this.isInitialized = true;
    console.log('[WordPopupService] Initialized');
  }

  /**
   * Set external event handler for popup events
   */
  public setEventHandler(handler: PopupEventHandler): void {
    this.eventHandler = handler;
  }

  /**
   * Destroy the service and cleanup
   */
  public destroy(): void {
    // Remove event listener (must match the capture phase setting)
    document.removeEventListener('click', this.boundHandleWordClick, true);
    
    // Remove styles
    this.styleElement?.remove();
    this.styleElement = null;
    
    // Destroy popup manager
    this.popupManager.destroy();
    
    this.isInitialized = false;
    console.log('[WordPopupService] Destroyed');
  }

  /**
   * Manually show popup for a word element
   */
  public showPopupForElement(element: HTMLElement, wordData: WordData): void {
    this.popupManager.show(element, wordData);
  }

  /**
   * Hide the popup
   */
  public hidePopup(): void {
    this.popupManager.hide();
  }

  /**
   * Set favorite state for current word
   */
  public setFavoriteState(isFavorited: boolean): void {
    this.popupManager.setFavoriteState(isFavorited);
  }

  // Private methods

  /**
   * Inject popup styles into the document
   */
  private injectStyles(): void {
    if (this.styleElement) return;
    
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'wxt-word-popup-styles';
    this.styleElement.textContent = WORD_POPUP_STYLES + this.getInteractiveStyles();
    document.head.appendChild(this.styleElement);
  }

  /**
   * Get additional interactive styles for translated words
   * Requirements: 2.1
   */
  private getInteractiveStyles(): string {
    return `
      /* Interactive translated word styles */
      ${TRANSLATED_WORD_SELECTOR} {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      ${TRANSLATED_WORD_SELECTOR}:hover {
        background-color: rgba(100, 255, 218, 0.15);
        border-radius: 3px;
      }
      
      ${TRANSLATED_WORD_SELECTOR}.${INTERACTIVE_CLASS} {
        position: relative;
      }
      
      ${TRANSLATED_WORD_SELECTOR}.${INTERACTIVE_CLASS}::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.5), transparent);
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      ${TRANSLATED_WORD_SELECTOR}.${INTERACTIVE_CLASS}:hover::after {
        opacity: 1;
      }
    `;
  }

  /**
   * Set up event delegation for translated word clicks
   */
  private setupEventDelegation(): void {
    console.log('[WordPopupService] Setting up event delegation for:', TRANSLATED_WORD_SELECTOR);
    document.addEventListener('click', this.boundHandleWordClick, true); // Use capture phase
    console.log('[WordPopupService] Event delegation set up');
  }

  /**
   * Handle click on translated word
   * Requirements: 2.1, 2.2
   */
  private async handleWordClick(e: Event): Promise<void> {
    console.log('[WordPopupService] handleWordClick called');
    const target = e.target as HTMLElement;
    
    console.log('[WordPopupService] Click detected on:', target, 'tagName:', target.tagName, 'className:', target.className);
    
    // Check if clicked element is a translated word
    const translatedWord = target.closest(TRANSLATED_WORD_SELECTOR) as HTMLElement;
    console.log('[WordPopupService] Closest translated word:', translatedWord);
    
    if (!translatedWord) {
      console.log('[WordPopupService] Not a translated word, ignoring');
      return;
    }
    
    console.log('[WordPopupService] Translated word clicked:', translatedWord.textContent);
    
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Get basic word data from element
    const wordData = this.extractWordData(translatedWord);
    if (!wordData) {
      console.warn('[WordPopupService] Could not extract word data from element');
      return;
    }
    
    console.log('[WordPopupService] Extracted word data:', wordData);
    
    // Show popup immediately with loading state
    this.popupManager.show(translatedWord, wordData);
    this.popupManager.setLoading(true);
    
    // Fetch complete word data asynchronously
    this.fetchCompleteWordData(wordData).then((completeData) => {
      console.log('[WordPopupService] Complete data fetched:', completeData);
      // Update popup with complete data
      this.popupManager.updateContent(completeData);
      this.popupManager.setLoading(false);
    }).catch((error) => {
      console.error('[WordPopupService] Failed to fetch complete word data:', error);
      this.popupManager.setLoading(false);
    });
    
    // Check and update favorite state (async, non-blocking)
    this.checkFavoriteState(wordData.word);
  }
  
  /**
   * Fetch complete word data including phonetics, meanings, and examples
   */
  private async fetchCompleteWordData(basicData: WordData): Promise<WordData> {
    const word = basicData.word.toLowerCase().trim();
    const completeData: WordData = { ...basicData };
    
    console.log('[WordPopupService] Fetching complete data for word:', word);
    
    // Get user's target language for translations
    const userSettings = await this.storageService.getUserSettings();
    const nativeLanguage = userSettings.multilingualConfig?.nativeLanguage || 'zh';
    
    // Parallel fetch phonetics and AI dictionary data
    const promises: Promise<void>[] = [];
    
    // Fetch phonetics from Dictionary API
    const phoneticPromise = this.dictionaryProvider.getPhonetic(word).then((result) => {
      console.log('[WordPopupService] Dictionary API result:', result);
      if (result.success && result.data) {
        // Extract phonetics with audio URLs
        const phonetics = result.data.phonetics || [];
        const ukPhoneticData = phonetics.find(p => p.audio?.includes('uk'));
        const usPhoneticData = phonetics.find(p => p.audio?.includes('us')) || phonetics[0];
        
        completeData.pronunciation = {
          phonetic: usPhoneticData?.text || ukPhoneticData?.text || '',
          ukPhonetic: ukPhoneticData?.text || '',
          usPhonetic: usPhoneticData?.text || phonetics[0]?.text || '',
          ukAudioUrl: ukPhoneticData?.audio || '',
          usAudioUrl: usPhoneticData?.audio || phonetics.find(p => p.audio)?.audio || '',
          audioUrl: phonetics.find(p => p.audio)?.audio || '',
        };
      }
    }).catch((error) => {
      console.warn('[WordPopupService] Dictionary API failed:', error);
    });
    
    promises.push(phoneticPromise);
    
    // Fetch complete dictionary data from AI
    const aiPromise = this.fetchAIDictionaryData(word, nativeLanguage).then((aiData) => {
      if (aiData) {
        completeData.meanings = aiData.meanings;
        if (aiData.morphology) {
          completeData.morphology = aiData.morphology;
        }
      }
    }).catch((error) => {
      console.warn('[WordPopupService] AI dictionary failed:', error);
    });
    
    promises.push(aiPromise);
    
    // Wait for all fetches to complete
    await Promise.allSettled(promises);
    
    return completeData;
  }
  
  /**
   * Fetch dictionary data from AI with full meanings, examples, and morphology
   */
  private async fetchAIDictionaryData(word: string, targetLanguage: string): Promise<{
    meanings: Meaning[];
    morphology?: MorphologyAnalysis;
  } | null> {
    const langName = this.getLanguageName(targetLanguage);
    
    const systemPrompt = `你是一个专业的英语词典助手。请为单词提供详细的${langName}释义。

要求：
1. 按词性分类，每个词性提供${langName}释义
2. 每个释义配一个英文例句和${langName}翻译
3. 如果单词有明显的构词结构，提供构词分析

返回JSON格式：
{
  "meanings": [
    {
      "pos": "n.",
      "def": "${langName}释义",
      "example": "English example sentence.",
      "exampleTrans": "例句的${langName}翻译"
    }
  ],
  "morphology": {
    "prefix": {"text": "前缀", "meaning": "含义"},
    "root": {"text": "词根", "meaning": "含义"},
    "suffix": {"text": "后缀", "meaning": "含义"}
  }
}

注意：
- morphology字段可选，只有当单词有明显构词结构时才返回
- 最多返回3个词性释义
- 只返回JSON，不要其他文字`;

    try {
      const result = await this.universalApi.call(word, {
        systemPrompt,
        temperature: 0,
        maxTokens: 500,
        timeout: 10000,
      });
      
      if (!result.success || !result.content) {
        return null;
      }
      
      // Parse JSON response
      const parsed = this.parseAIDictionaryResponse(result.content);
      return parsed;
    } catch (error) {
      console.error('[WordPopupService] AI dictionary request failed:', error);
      return null;
    }
  }
  
  /**
   * Parse AI dictionary JSON response
   */
  private parseAIDictionaryResponse(content: string): {
    meanings: Meaning[];
    morphology?: MorphologyAnalysis;
  } | null {
    try {
      // Try to extract JSON from response
      let jsonStr = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      
      const data = JSON.parse(jsonStr);
      
      const meanings: Meaning[] = [];
      if (data.meanings && Array.isArray(data.meanings)) {
        for (const m of data.meanings) {
          meanings.push({
            partOfSpeech: m.pos || '',
            definition: m.def || '',
            example: m.example || '',
            exampleTranslation: m.exampleTrans || '',
          });
        }
      }
      
      let morphology: MorphologyAnalysis | undefined;
      if (data.morphology) {
        morphology = {};
        if (data.morphology.prefix) {
          morphology.prefix = {
            text: data.morphology.prefix.text || '',
            meaning: data.morphology.prefix.meaning || '',
          };
        }
        if (data.morphology.root) {
          morphology.root = {
            text: data.morphology.root.text || '',
            meaning: data.morphology.root.meaning || '',
          };
        }
        if (data.morphology.suffix) {
          morphology.suffix = {
            text: data.morphology.suffix.text || '',
            meaning: data.morphology.suffix.meaning || '',
          };
        }
      }
      
      return { meanings, morphology };
    } catch (error) {
      console.warn('[WordPopupService] Failed to parse AI dictionary response:', error);
      
      // Fallback: try to parse as simple text
      return this.parseSimpleTextResponse(content);
    }
  }
  
  /**
   * Fallback parser for non-JSON responses
   */
  private parseSimpleTextResponse(content: string): { meanings: Meaning[]; } | null {
    const meanings: Meaning[] = [];
    const lines = content.split('\n').filter(l => l.trim());
    
    for (const line of lines) {
      const match = line.match(/^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|interj\.)\s*(.+)$/i);
      if (match) {
        meanings.push({
          partOfSpeech: match[1].toLowerCase(),
          definition: match[2].trim(),
          example: '',
          exampleTranslation: '',
        });
      }
    }
    
    return meanings.length > 0 ? { meanings } : null;
  }
  
  /**
   * Get display name for language code
   */
  private getLanguageName(langCode: string): string {
    const langMap: Record<string, string> = {
      'zh': '中文',
      'zh-CN': '中文',
      'zh-TW': '繁体中文',
      'en': 'English',
      'ja': '日本語',
      'ko': '한국어',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
      'pt': 'Português',
      'ru': 'Русский',
      'it': 'Italiano',
    };
    return langMap[langCode] || langCode;
  }

  /**
   * Extract word data from translated word element
   */
  private extractWordData(element: HTMLElement): WordData | null {
    // Get the translation text (the content of the element - this is the translated word, e.g., Chinese)
    const translationText = element.textContent?.trim().replace(/[()]/g, '').trim() || '';
    
    // Get the original text from data attribute (this is the original English word)
    const originalText = element.getAttribute('data-original-text') || '';
    
    console.log('[WordPopupService] extractWordData - translationText:', translationText, 'originalText:', originalText);
    console.log('[WordPopupService] element attributes:', element.getAttributeNames(), element.outerHTML.substring(0, 200));
    
    if (!translationText && !originalText) {
      return null;
    }
    
    // Determine which text to use for dictionary lookup
    // If originalText exists and looks like English, use it
    // Otherwise fall back to translationText
    const isEnglish = (text: string) => /^[a-zA-Z\s\-']+$/.test(text);
    const wordForLookup = (originalText && isEnglish(originalText)) ? originalText : 
                          (isEnglish(translationText) ? translationText : originalText || translationText);
    
    console.log('[WordPopupService] wordForLookup:', wordForLookup);
    
    // Create basic word data
    // IMPORTANT: 'word' should be the ORIGINAL English word for dictionary lookup
    // 'originalText' stores the original English word
    // The translation (Chinese) is displayed in the popup but we look up the English word
    const wordData: WordData = {
      word: wordForLookup,
      originalText: originalText || translationText,
      pronunciation: {
        phonetic: '', // Will be fetched from API
      },
      meanings: [], // Will be fetched from API
      exampleSentences: [], // Will be fetched from API
      sourceUrl: window.location.href,
      context: this.extractContext(element),
    };
    
    return wordData;
  }

  /**
   * Extract context around the word
   */
  private extractContext(element: HTMLElement): string {
    // Try to get the parent paragraph or sentence
    const parent = element.closest('p, div, span, li, td, th, h1, h2, h3, h4, h5, h6');
    if (parent) {
      const text = parent.textContent || '';
      // Limit context length
      if (text.length > 200) {
        return text.substring(0, 200) + '...';
      }
      return text;
    }
    return '';
  }

  /**
   * Handle popup events (favorite, audio, etc.)
   */
  private handlePopupEvent(type: PopupEventType, data?: any): void {
    console.log(`[WordPopupService] Popup event: ${type}`, data);
    
    // Forward to external handler if set
    this.eventHandler?.(type, data);
    
    // Handle specific events
    switch (type) {
      case 'favorite':
        this.handleFavorite(data);
        break;
      case 'unfavorite':
        this.handleUnfavorite(data);
        break;
      case 'playAudio':
        this.handlePlayAudio(data);
        break;
      case 'loginRequired':
        this.handleLoginRequired();
        break;
      case 'addTag':
        this.handleAddTag(data);
        break;
      case 'removeTag':
        this.handleRemoveTag(data);
        break;
      case 'close':
        // Popup closed, no action needed
        break;
    }
  }

  /**
   * Handle favorite action
   * Requirements: 3.1, 3.4
   */
  private async handleFavorite(wordData: WordData): Promise<void> {
    console.log('[WordPopupService] Favorite word:', wordData.word);
    
    // Check if user is logged in
    const isLoggedIn = await authService.isAuthenticated();
    if (!isLoggedIn) {
      this.handleLoginRequired();
      return;
    }
    
    try {
      // Convert WordData to FavoriteWordInput
      const favoriteInput: FavoriteWordInput = {
        word: wordData.word,
        originalText: wordData.originalText,
        pronunciation: wordData.pronunciation,
        meanings: wordData.meanings,
        exampleSentences: wordData.exampleSentences,
        sourceUrl: wordData.sourceUrl,
        context: wordData.context,
      };
      
      // Favorite the word using VocabularyService
      await vocabularyService.favoriteWord(favoriteInput);
      
      // Update UI state to show favorited
      this.popupManager.setFavoriteState(true);
    } catch (error) {
      console.error('[WordPopupService] Failed to favorite word:', error);
      // Check if it's an auth error
      if (error && typeof error === 'object' && 'code' in error && error.code === 'VOCAB_AUTH_REQUIRED') {
        this.handleLoginRequired();
      }
    }
  }

  /**
   * Handle unfavorite action
   * Requirements: 3.3
   */
  private async handleUnfavorite(wordData: WordData): Promise<void> {
    console.log('[WordPopupService] Unfavorite word:', wordData.word);
    
    try {
      // Get the favorite word to get its ID
      const favoriteWord = await vocabularyService.getFavoriteByWord(wordData.word);
      if (favoriteWord) {
        await vocabularyService.unfavoriteWord(favoriteWord.id);
      }
      
      // Update UI state to show unfavorited
      this.popupManager.setFavoriteState(false);
    } catch (error) {
      console.error('[WordPopupService] Failed to unfavorite word:', error);
    }
  }

  /**
   * Handle play audio action
   * Requirements: 2.3
   */
  private handlePlayAudio(data: { wordData: WordData; accent: string }): void {
    const { wordData, accent } = data;
    console.log('[WordPopupService] Play audio for:', wordData.word, 'accent:', accent);
    
    // Try to use audio URL from pronunciation data first
    const pronunciation = wordData.pronunciation;
    let audioUrl = '';
    
    if (accent === 'uk' && pronunciation.ukAudioUrl) {
      audioUrl = pronunciation.ukAudioUrl;
    } else if (accent === 'us' && pronunciation.usAudioUrl) {
      audioUrl = pronunciation.usAudioUrl;
    } else if (pronunciation.audioUrl) {
      audioUrl = pronunciation.audioUrl;
    }
    
    if (audioUrl) {
      // Play audio from URL
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.warn('[WordPopupService] Failed to play audio URL, falling back to TTS:', error);
        this.playTTS(wordData.word, accent);
      });
    } else {
      // Fallback to Web Speech API
      this.playTTS(wordData.word, accent);
    }
  }
  
  /**
   * Play text-to-speech for a word
   */
  private playTTS(word: string, accent: string): void {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }

  /**
   * Handle login required
   * Requirements: 3.4
   */
  private handleLoginRequired(): void {
    console.log('[WordPopupService] Login required for this action');
    
    // Emit loginRequired event for external handlers
    this.eventHandler?.('loginRequired', undefined);
    
    // Show a notification to the user
    // This could be enhanced to show a modal or redirect to login
    this.showLoginPrompt();
  }

  /**
   * Show login prompt to user
   * Requirements: 3.4
   */
  private showLoginPrompt(): void {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = 'wxt-login-notification';
    notification.innerHTML = `
      <div class="wxt-login-notification-content">
        <span>请先登录以收藏单词</span>
        <button class="wxt-login-notification-close">×</button>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .wxt-login-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid #48484a;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: wxt-slide-in 0.3s ease;
      }
      
      @keyframes wxt-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .wxt-login-notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .wxt-login-notification-close {
        background: none;
        border: none;
        color: #a0a0a0;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        line-height: 1;
      }
      
      .wxt-login-notification-close:hover {
        color: white;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Add close handler
    const closeBtn = notification.querySelector('.wxt-login-notification-close');
    closeBtn?.addEventListener('click', () => {
      notification.remove();
      style.remove();
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }

  /**
   * Check and update favorite state for current word
   */
  private async checkFavoriteState(word: string): Promise<void> {
    try {
      const isFavorited = await vocabularyService.isFavorited(word);
      this.popupManager.setFavoriteState(isFavorited);
      
      // If favorited, also load and display tags
      if (isFavorited) {
        const favoriteWord = await vocabularyService.getFavoriteByWord(word);
        if (favoriteWord) {
          this.popupManager.updateTags(favoriteWord.tags);
        }
      }
    } catch (error) {
      // Silently fail - user might not be logged in
      console.debug('[WordPopupService] Could not check favorite state:', error);
    }
  }

  /**
   * Handle add tag action
   * Requirements: 9.5
   */
  private async handleAddTag(data: { tag: string; wordData: WordData }): Promise<void> {
    console.log('[WordPopupService] Add tag:', data.tag, 'to word:', data.wordData.word);
    
    try {
      // Get the favorite word to get its ID
      const favoriteWord = await vocabularyService.getFavoriteByWord(data.wordData.word);
      if (favoriteWord) {
        await vocabularyService.addTag(favoriteWord.id, data.tag);
        
        // Update the popup with new tags
        const updatedWord = await vocabularyService.getFavoriteByWord(data.wordData.word);
        if (updatedWord) {
          this.popupManager.updateTags(updatedWord.tags);
        }
      }
    } catch (error) {
      console.error('[WordPopupService] Failed to add tag:', error);
    }
  }

  /**
   * Handle remove tag action
   * Requirements: 9.5
   */
  private async handleRemoveTag(data: { tag: string; wordData: WordData }): Promise<void> {
    console.log('[WordPopupService] Remove tag:', data.tag, 'from word:', data.wordData.word);
    
    try {
      // Get the favorite word to get its ID
      const favoriteWord = await vocabularyService.getFavoriteByWord(data.wordData.word);
      if (favoriteWord) {
        await vocabularyService.removeTag(favoriteWord.id, data.tag);
        
        // Update the popup with new tags
        const updatedWord = await vocabularyService.getFavoriteByWord(data.wordData.word);
        if (updatedWord) {
          this.popupManager.updateTags(updatedWord.tags);
        }
      }
    } catch (error) {
      console.error('[WordPopupService] Failed to remove tag:', error);
    }
  }
}

// Export singleton getter
export const getWordPopupService = () => WordPopupService.getInstance();
