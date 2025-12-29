/**
 * Word Popup Manager
 * Manages the display, positioning, and interaction of word popup component
 * Requirements: 2.1, 2.2
 */

import type { 
  WordData, 
  PopupPosition, 
  PopupState, 
  PopupEventHandler,
  WordPopupConfig 
} from './types';
import { DEFAULT_POPUP_CONFIG } from './types';
import { WordPopupTemplate } from './WordPopupTemplate';

const CSS_CLASSES = {
  POPUP: 'wxt-word-popup',
  POPUP_VISIBLE: 'wxt-word-popup--visible',
  POPUP_ARROW_TOP: 'wxt-word-popup--arrow-top',
  POPUP_ARROW_BOTTOM: 'wxt-word-popup--arrow-bottom',
};

const POPUP_DIMENSIONS = {
  WIDTH: 400,
  MIN_HEIGHT: 150,
  ARROW_HEIGHT: 8,
  VIEWPORT_PADDING: 16,
};

const SVG_ICONS = {
  STAR_EMPTY: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  STAR_FILLED: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
};

export class WordPopupManager {
  private static instance: WordPopupManager;
  private popupElement: HTMLElement | null = null;
  private config: WordPopupConfig;
  private state: PopupState;
  private eventHandler: PopupEventHandler | null = null;
  private currentTargetElement: HTMLElement | null = null;
  private currentWordData: WordData | null = null;
  private boundHandleClickOutside: (e: MouseEvent) => void;
  private boundHandleEscapeKey: (e: KeyboardEvent) => void;

  private constructor(config: Partial<WordPopupConfig> = {}) {
    this.config = { ...DEFAULT_POPUP_CONFIG, ...config };
    this.state = {
      visible: false,
      wordData: null,
      isFavorited: false,
      isLoading: false,
      tags: [],
    };
    this.boundHandleClickOutside = this.handleClickOutside.bind(this);
    this.boundHandleEscapeKey = this.handleEscapeKey.bind(this);
  }

  public static getInstance(config?: Partial<WordPopupConfig>): WordPopupManager {
    if (!WordPopupManager.instance) {
      WordPopupManager.instance = new WordPopupManager(config);
    }
    return WordPopupManager.instance;
  }

  public setEventHandler(handler: PopupEventHandler): void {
    this.eventHandler = handler;
  }

  public show(element: HTMLElement, wordData: WordData): void {
    this.currentTargetElement = element;
    this.currentWordData = wordData;
    this.state.wordData = wordData;
    this.state.visible = true;
    if (!this.popupElement) {
      this.createPopupElement();
    }
    this.updateContent(wordData);
    const position = this.calculatePosition(element);
    this.setPosition(position);
    this.popupElement?.classList.add(CSS_CLASSES.POPUP_VISIBLE);
    this.addDismissalListeners();
  }

  public hide(): void {
    if (!this.popupElement || !this.state.visible) return;
    this.state.visible = false;
    this.popupElement.classList.remove(CSS_CLASSES.POPUP_VISIBLE);
    this.currentTargetElement = null;
    this.currentWordData = null;
    this.removeDismissalListeners();
    this.emitEvent('close');
  }


  public updateContent(wordData: WordData): void {
    if (!this.popupElement) return;
    this.state.wordData = wordData;
    this.currentWordData = wordData;
    
    const wordText = this.popupElement.querySelector('.wxt-word-text');
    if (wordText) wordText.textContent = wordData.word;
    
    const pronunciationSection = this.popupElement.querySelector('.wxt-pronunciation-section');
    if (pronunciationSection) {
      pronunciationSection.innerHTML = WordPopupTemplate.renderPronunciation(wordData.pronunciation);
      this.setupAudioButtonListeners();
    }
    
    // Update context section (语境强化)
    // contextSentence is the original Chinese sentence
    // contextSentenceTranslation is the English translation
    // Use originalText (Chinese word) for highlighting in the Chinese sentence
    const contextSection = this.popupElement.querySelector('.wxt-context-section') as HTMLElement;
    const contextBox = this.popupElement.querySelector('.wxt-context-box');
    if (contextSection && contextBox) {
      if (wordData.contextSentence) {
        const contextHtml = WordPopupTemplate.renderContext(
          wordData.contextSentence,
          wordData.contextSentenceTranslation,
          wordData.originalText // Use Chinese original word for highlighting
        );
        contextBox.innerHTML = contextHtml;
        contextSection.style.display = 'block';
      } else {
        contextSection.style.display = 'none';
      }
    }
    
    const meaningsContainer = this.popupElement.querySelector('.wxt-meanings-list');
    if (meaningsContainer) {
      meaningsContainer.innerHTML = WordPopupTemplate.renderMeanings(wordData.meanings);
    }
    
    const morphologySection = this.popupElement.querySelector('.wxt-morphology-section') as HTMLElement;
    const morphologyGrid = this.popupElement.querySelector('.wxt-morphology-grid');
    if (morphologySection && morphologyGrid) {
      const morphologyHtml = WordPopupTemplate.renderMorphology(wordData.morphology);
      if (morphologyHtml) {
        morphologyGrid.innerHTML = morphologyHtml;
        morphologySection.style.display = 'block';
      } else {
        morphologySection.style.display = 'none';
      }
    }
  }

  public setFavoriteState(isFavorited: boolean): void {
    this.state.isFavorited = isFavorited;
    const favoriteBtn = this.popupElement?.querySelector('.wxt-favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.innerHTML = isFavorited ? SVG_ICONS.STAR_FILLED : SVG_ICONS.STAR_EMPTY;
      favoriteBtn.classList.toggle('wxt-favorite-btn--active', isFavorited);
    }
    
    const tagsSection = this.popupElement?.querySelector('.wxt-word-tags');
    if (tagsSection) {
      tagsSection.classList.toggle('wxt-word-tags--hidden', !isFavorited);
    }
  }

  public updateTags(tags: string[]): void {
    this.state.tags = tags;
    const tagsContainer = this.popupElement?.querySelector('.wxt-tags-cloud');
    if (tagsContainer) {
      tagsContainer.innerHTML = WordPopupTemplate.renderTags(tags);
      this.setupTagRemoveListeners();
    }
  }

  public getTags(): string[] {
    return this.state.tags || [];
  }

  public setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    this.popupElement?.classList.toggle('wxt-word-popup--loading', isLoading);
  }

  public getState(): PopupState {
    return { ...this.state };
  }

  public destroy(): void {
    this.hide();
    this.popupElement?.remove();
    this.popupElement = null;
    this.eventHandler = null;
  }

  private createPopupElement(): void {
    this.popupElement = document.createElement('div');
    this.popupElement.className = CSS_CLASSES.POPUP;
    this.popupElement.style.zIndex = String(this.config.zIndex);
    this.popupElement.innerHTML = WordPopupTemplate.getTemplate(
      this.config.enableAudio, 
      this.config.enableFavorite, 
      this.config.enableTags
    );
    this.setupPopupEventListeners();
    document.body.appendChild(this.popupElement);
  }

  private setupPopupEventListeners(): void {
    if (!this.popupElement) return;
    
    const favoriteBtn = this.popupElement.querySelector('.wxt-favorite-btn');
    favoriteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventType = this.state.isFavorited ? 'unfavorite' : 'favorite';
      this.emitEvent(eventType, this.state.wordData);
    });
    
    this.setupTagInputListeners();
    this.setupAudioButtonListeners();
  }

  private setupAudioButtonListeners(): void {
    if (!this.popupElement) return;
    
    const audioButtons = this.popupElement.querySelectorAll('.wxt-pronunciation-audio-btn');
    audioButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const accent = (btn as HTMLElement).dataset.accent || 'us';
        this.emitEvent('playAudio', { wordData: this.currentWordData, accent });
      });
    });
  }

  private setupTagInputListeners(): void {
    if (!this.popupElement) return;
    
    const tagInput = this.popupElement.querySelector('.wxt-tag-input') as HTMLInputElement;
    const tagAddBtn = this.popupElement.querySelector('.wxt-tag-add-btn');
    
    if (tagInput && tagAddBtn) {
      tagAddBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAddTag(tagInput);
      });
      
      tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          this.handleAddTag(tagInput);
        }
      });
      
      tagInput.addEventListener('click', (e) => e.stopPropagation());
    }
    
    this.setupTagRemoveListeners();
  }

  private setupTagRemoveListeners(): void {
    if (!this.popupElement) return;
    
    const removeButtons = this.popupElement.querySelectorAll('.wxt-tag-remove');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = (btn as HTMLElement).dataset.tag;
        if (tag) {
          this.emitEvent('removeTag', { tag, wordData: this.state.wordData });
        }
      });
    });
  }

  private handleAddTag(input: HTMLInputElement): void {
    const tag = input.value.trim().toLowerCase();
    if (tag && tag.length > 0 && tag.length <= 30 && !this.state.tags?.includes(tag)) {
      this.emitEvent('addTag', { tag, wordData: this.state.wordData });
      input.value = '';
    }
  }

  private calculatePosition(element: HTMLElement): PopupPosition {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let left = rect.left + scrollLeft + (rect.width / 2) - (POPUP_DIMENSIONS.WIDTH / 2);
    if (left < POPUP_DIMENSIONS.VIEWPORT_PADDING) {
      left = POPUP_DIMENSIONS.VIEWPORT_PADDING;
    } else if (left + POPUP_DIMENSIONS.WIDTH > viewportWidth - POPUP_DIMENSIONS.VIEWPORT_PADDING) {
      left = viewportWidth - POPUP_DIMENSIONS.WIDTH - POPUP_DIMENSIONS.VIEWPORT_PADDING;
    }
    
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    let top: number;
    let arrowPosition: 'top' | 'bottom';
    
    if (spaceBelow >= POPUP_DIMENSIONS.MIN_HEIGHT + POPUP_DIMENSIONS.ARROW_HEIGHT) {
      top = rect.bottom + scrollTop + POPUP_DIMENSIONS.ARROW_HEIGHT;
      arrowPosition = 'top';
    } else if (spaceAbove >= POPUP_DIMENSIONS.MIN_HEIGHT + POPUP_DIMENSIONS.ARROW_HEIGHT) {
      top = rect.top + scrollTop - POPUP_DIMENSIONS.MIN_HEIGHT - POPUP_DIMENSIONS.ARROW_HEIGHT;
      arrowPosition = 'bottom';
    } else {
      top = rect.bottom + scrollTop + POPUP_DIMENSIONS.ARROW_HEIGHT;
      arrowPosition = 'top';
    }
    
    return { top, left, arrowPosition };
  }

  private setPosition(position: PopupPosition): void {
    if (!this.popupElement) return;
    this.popupElement.style.top = `${position.top}px`;
    this.popupElement.style.left = `${position.left}px`;
    this.popupElement.style.width = `${POPUP_DIMENSIONS.WIDTH}px`;
    this.popupElement.classList.remove(CSS_CLASSES.POPUP_ARROW_TOP, CSS_CLASSES.POPUP_ARROW_BOTTOM);
    this.popupElement.classList.add(
      position.arrowPosition === 'top' ? CSS_CLASSES.POPUP_ARROW_TOP : CSS_CLASSES.POPUP_ARROW_BOTTOM
    );
  }

  private addDismissalListeners(): void {
    setTimeout(() => {
      document.addEventListener('click', this.boundHandleClickOutside);
    }, 10);
    document.addEventListener('keydown', this.boundHandleEscapeKey);
  }

  private removeDismissalListeners(): void {
    document.removeEventListener('click', this.boundHandleClickOutside);
    document.removeEventListener('keydown', this.boundHandleEscapeKey);
  }

  private handleClickOutside(e: MouseEvent): void {
    if (!this.popupElement || !this.state.visible) return;
    const target = e.target as Node;
    if (!this.popupElement.contains(target) && 
        this.currentTargetElement !== target &&
        !this.currentTargetElement?.contains(target)) {
      this.hide();
    }
  }

  private handleEscapeKey(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.state.visible) {
      this.hide();
    }
  }

  private emitEvent(type: Parameters<PopupEventHandler>[0], data?: unknown): void {
    this.eventHandler?.(type, data);
  }
}
