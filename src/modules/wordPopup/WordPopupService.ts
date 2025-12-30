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
    
    // Fetch complete dictionary data from AI (including context sentence translation)
    // Pass the exact word form used in the article for consistent translation
    const aiPromise = this.fetchAIDictionaryData(
      word, 
      nativeLanguage, 
      basicData.contextSentence,
      basicData.originalText  // The original Chinese word that was translated
    ).then((aiData) => {
      if (aiData) {
        completeData.meanings = aiData.meanings;
        if (aiData.morphology) {
          completeData.morphology = aiData.morphology;
        }
        if (aiData.contextTranslation) {
          completeData.contextSentenceTranslation = aiData.contextTranslation;
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
   * @param word - The English word to look up
   * @param targetLanguage - The user's native language for definitions
   * @param contextSentence - The original Chinese sentence containing the word
   * @param originalChineseWord - The original Chinese word that was translated to this English word
   */
  private async fetchAIDictionaryData(
    word: string, 
    targetLanguage: string, 
    contextSentence?: string,
    originalChineseWord?: string
  ): Promise<{
    meanings: Meaning[];
    morphology?: MorphologyAnalysis;
    contextTranslation?: string;
  } | null> {
    const langName = this.getLanguageName(targetLanguage);
    
    // Build the prompt with optional context sentence (Chinese sentence to be translated to English)
    // Include the exact English word form to use in the translation
    let contextPart = '';
    if (contextSentence) {
      contextPart = `\n\n原句语境（中文）："${contextSentence}"`;
      if (originalChineseWord) {
        contextPart += `\n注意：原文中的"${originalChineseWord}"在文章中被翻译为"${word}"，请在翻译整句时，对应位置必须使用"${word}"这个词形（不要改变词形，如不要把summarize改成summarizing）。`;
      }
      contextPart += `\n请将这个中文原句翻译成英文，放在contextTrans字段中。`;
    }
    
    const systemPrompt = `你是一个专业的英语词典助手。请为单词"${word}"提供详细的${langName}释义。${contextPart}

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
  },
  "contextTrans": "中文原句的英文翻译（如果提供了原句，必须在对应位置使用${word}）"
}

注意：
- morphology字段可选，只有当单词有明显构词结构时才返回
- contextTrans字段可选，只有当提供了原句时才返回
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
    contextTranslation?: string;
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
      
      // Extract context translation
      const contextTranslation = data.contextTrans || undefined;
      
      return { meanings, morphology, contextTranslation };
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
    // Get the translation text (the content of the element - this is the English translation)
    const translationText = element.textContent?.trim().replace(/[()]/g, '').trim() || '';
    
    // Get the original text from data attribute (this is the original Chinese word before translation)
    const originalText = element.getAttribute('data-original-text') || '';
    
    console.log('[WordPopupService] extractWordData - translationText:', translationText, 'originalText:', originalText);
    console.log('[WordPopupService] element attributes:', element.getAttributeNames(), element.outerHTML.substring(0, 200));
    
    if (!translationText && !originalText) {
      return null;
    }
    
    // Determine which text to use for dictionary lookup
    // translationText is the English word (what user clicked)
    // originalText is the Chinese source word
    const isEnglish = (text: string) => /^[a-zA-Z\s\-']+$/.test(text);
    
    // Use the English translation text for dictionary lookup
    const wordForLookup = isEnglish(translationText) ? translationText : 
                          (originalText && isEnglish(originalText)) ? originalText : translationText;
    
    console.log('[WordPopupService] wordForLookup:', wordForLookup);
    
    // Get the original page word (the word that was on the page before translation)
    // This is stored in the sibling .wxt-original-word element
    const originalPageWord = this.getOriginalPageWord(element);
    
    console.log('[WordPopupService] originalPageWord:', originalPageWord);
    
    // Extract the Chinese sentence containing the original word (语境强化)
    // Use the original Chinese word to search in the original Chinese text
    // Prefer originalText (from data-original-text attribute) as it's more reliable
    const originalChineseWord = originalText || originalPageWord || '';
    
    console.log('[WordPopupService] Using originalChineseWord for sentence extraction:', originalChineseWord);
    
    const contextSentence = this.extractSentence(element, originalChineseWord);
    
    // Create basic word data
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
      contextSentence: contextSentence,
    };
    
    return wordData;
  }
  
  /**
   * Get the original page word from the sibling .wxt-original-word element
   */
  private getOriginalPageWord(element: HTMLElement): string {
    // The structure is usually: <span class="wxt-original-word">原文</span><span class="wxt-translation-term">翻译</span>
    // or the reverse depending on settings
    
    // Check previous sibling
    let sibling = element.previousElementSibling;
    if (sibling?.classList.contains('wxt-original-word')) {
      let text = sibling.textContent || '';
      // Remove parentheses if present
      text = text.replace(/^\(|\)$/g, '').trim();
      return text;
    }
    
    // Check next sibling
    sibling = element.nextElementSibling;
    if (sibling?.classList.contains('wxt-original-word')) {
      let text = sibling.textContent || '';
      text = text.replace(/^\(|\)$/g, '').trim();
      return text;
    }
    
    // Check parent's children
    const parent = element.parentElement;
    if (parent) {
      const originalWord = parent.querySelector('.wxt-original-word');
      if (originalWord) {
        let text = originalWord.textContent || '';
        text = text.replace(/^\(|\)$/g, '').trim();
        return text;
      }
    }
    
    return '';
  }
  
  /**
   * Extract the sentence containing the word (语境强化)
   * Extracts the original Chinese sentence from the page, which will be translated by AI
   * @param element - The clicked translation element
   * @param originalWord - The original Chinese word to search for
   */
  private extractSentence(element: HTMLElement, originalWord: string): string {
    console.log('[WordPopupService] extractSentence called for word:', originalWord);
    
    if (!originalWord) return '';
    
    // Strategy: Find the closest paragraph-like container
    const container = element.closest('p, li, h1, h2, h3, h4, h5, h6, td, th, blockquote, figcaption, div') as HTMLElement;
    
    if (!container) {
      console.log('[WordPopupService] No suitable container found');
      return '';
    }
    
    console.log('[WordPopupService] Found container:', container.tagName);
    
    // Get the original Chinese text from container (before translation)
    const originalText = this.getOriginalTextFromContainer(container);
    
    console.log('[WordPopupService] Original text:', originalText?.substring(0, 150));
    
    if (!originalText) {
      console.log('[WordPopupService] No original text found');
      return '';
    }
    
    // Find the sentence containing the original word
    // First try with the exact word
    let sentence = this.extractSentenceWithWord(originalText, originalWord);
    
    // If not found, try to find the sentence by locating the element's position in the DOM
    if (!sentence) {
      console.log('[WordPopupService] Word not found in text, trying position-based extraction');
      sentence = this.extractSentenceByPosition(element, container, originalText);
    }
    
    console.log('[WordPopupService] Extracted sentence:', sentence?.substring(0, 100));
    
    return sentence || '';
  }
  
  /**
   * Extract sentence by finding the element's approximate position in the container
   * This is a fallback when the word cannot be found directly in the extracted text
   */
  private extractSentenceByPosition(element: HTMLElement, container: HTMLElement, fullText: string): string {
    // Get all text nodes and translation elements in order
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return NodeFilter.FILTER_ACCEPT;
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.classList.contains('wxt-translation-term') || 
                el.classList.contains('wxt-original-word')) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );
    
    // Find the position of the clicked element relative to text content
    let textBeforeElement = '';
    let node: Node | null;
    let foundElement = false;
    
    while ((node = walker.nextNode())) {
      if (node === element || (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).contains(element))) {
        foundElement = true;
        break;
      }
      
      if (node.nodeType === Node.TEXT_NODE) {
        textBeforeElement += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList.contains('wxt-original-word')) {
          let text = el.textContent || '';
          text = text.replace(/^\s*\(|\)\s*$/g, '').trim();
          textBeforeElement += text;
        }
        // Skip translation terms as they're not part of original text
      }
    }
    
    if (!foundElement) {
      console.log('[WordPopupService] Element not found in container tree');
      return '';
    }
    
    console.log('[WordPopupService] Text before element length:', textBeforeElement.length);
    
    // Now find which sentence in fullText corresponds to this position
    // Split fullText into sentences and find the one at the approximate position
    const sentences = fullText.split(/(?<=[。！？.!?])\s*/);
    let currentPos = 0;
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      const sentenceEnd = currentPos + trimmed.length;
      
      // Check if the element position falls within this sentence
      // Use a tolerance range since positions might not match exactly
      if (textBeforeElement.length >= currentPos && textBeforeElement.length <= sentenceEnd + 10) {
        console.log('[WordPopupService] Found sentence by position:', trimmed.substring(0, 50));
        return trimmed;
      }
      
      currentPos = sentenceEnd + 1; // +1 for the punctuation
    }
    
    return '';
  }
  
  /**
   * Get original text from container (the text before translation)
   * This extracts the original Chinese content
   */
  private getOriginalTextFromContainer(container: HTMLElement): string {
    // Clone to avoid modifying DOM
    const clone = container.cloneNode(true) as HTMLElement;
    
    console.log('[WordPopupService] Container HTML before processing:', clone.innerHTML.substring(0, 500));
    
    // The DOM structure for translated words is typically:
    // <span class="wxt-original-word">(原文)</span><span class="wxt-translation-term" data-original-text="原文">translation</span>
    // We need to keep only ONE copy of the original text
    
    // Strategy: Remove translation terms completely (they are duplicates of original-word content)
    // The original text is already preserved in .wxt-original-word elements
    clone.querySelectorAll('.wxt-translation-term').forEach(el => {
      el.remove();
    });
    
    // Unwrap original word wrappers (keep their text content as plain text)
    // But first, ensure we handle hidden original words correctly
    clone.querySelectorAll('.wxt-original-word').forEach(wrapper => {
      // Remove display:none style if present (for hidden mode)
      (wrapper as HTMLElement).style.display = '';
      
      let text = wrapper.textContent || '';
      // Remove parentheses if present
      text = text.replace(/^\s*\(|\)\s*$/g, '').trim();
      const textNode = document.createTextNode(text);
      wrapper.parentNode?.replaceChild(textNode, wrapper);
    });
    
    // Get clean text and normalize whitespace
    let text = clone.textContent || '';
    text = text.replace(/\s*\(\s*\)\s*/g, ''); // Remove empty parentheses
    text = text.replace(/\s+/g, ' ').trim();
    
    console.log('[WordPopupService] getOriginalTextFromContainer result:', text.substring(0, 200));
    
    return text;
  }
  
  /**
   * Extract the sentence containing a specific word
   */
  private extractSentenceWithWord(text: string, word: string): string {
    if (!word) return '';
    
    console.log('[WordPopupService] extractSentenceWithWord - searching for:', word, 'in text length:', text.length);
    
    // Split by common sentence-ending punctuation (both Chinese and English)
    // Use more comprehensive punctuation: 。！？；.!?; and also handle comma-separated clauses for long text
    const sentences = text.split(/(?<=[。！？.!?])\s*/);
    
    console.log('[WordPopupService] Split into', sentences.length, 'sentences');
    
    // Find sentence containing the word
    const wordLower = word.toLowerCase();
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      // Check if this sentence contains the word
      const containsWord = trimmed.includes(word) || trimmed.toLowerCase().includes(wordLower);
      console.log('[WordPopupService] Sentence', i, ':', trimmed.substring(0, 50), '... contains word:', containsWord);
      
      if (containsWord) {
        // If sentence is still too long (>120 chars), try to split by secondary punctuation
        if (trimmed.length > 120) {
          const clauses = trimmed.split(/(?<=[，,；;：:])\s*/);
          for (const clause of clauses) {
            const clauseTrimmed = clause.trim();
            if (clauseTrimmed && (clauseTrimmed.includes(word) || clauseTrimmed.toLowerCase().includes(wordLower))) {
              // Return the clause, max 100 chars
              if (clauseTrimmed.length > 100) {
                const idx = clauseTrimmed.toLowerCase().indexOf(wordLower);
                if (idx >= 0) {
                  const start = Math.max(0, idx - 40);
                  const end = Math.min(clauseTrimmed.length, idx + word.length + 40);
                  let segment = clauseTrimmed.substring(start, end);
                  if (start > 0) segment = '...' + segment;
                  if (end < clauseTrimmed.length) segment += '...';
                  return segment;
                }
              }
              return clauseTrimmed;
            }
          }
        }
        return trimmed;
      }
    }
    
    console.log('[WordPopupService] Word not found in any sentence');
    return '';
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
