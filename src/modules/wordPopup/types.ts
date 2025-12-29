/**
 * Word Popup module type definitions
 * Contains interfaces for word popup functionality
 */

// Pronunciation data
export interface Pronunciation {
  phonetic: string;
  audioUrl?: string;
  ukPhonetic?: string;
  usPhonetic?: string;
  ukAudioUrl?: string;
  usAudioUrl?: string;
}

// Word meaning with example
export interface Meaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
  exampleTranslation?: string;
  examples?: string[];
}

// Example sentence
export interface ExampleSentence {
  sentence: string;
  translation: string;
  source?: string;
}

// Word morphology analysis (构词分析)
export interface MorphologyAnalysis {
  prefix?: { text: string; meaning: string };
  root?: { text: string; meaning: string };
  suffix?: { text: string; meaning: string };
  etymology?: string;
}

// Complete word data for popup display
export interface WordData {
  word: string;
  originalText: string;
  pronunciation: Pronunciation;
  meanings: Meaning[];
  exampleSentences: ExampleSentence[];
  morphology?: MorphologyAnalysis;
  sourceUrl: string;
  context?: string;
  /** 单词所在的原句（用于语境强化） */
  contextSentence?: string;
  /** 原句的翻译 */
  contextSentenceTranslation?: string;
}

// Popup position configuration
export interface PopupPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom';
}

// Popup state
export interface PopupState {
  visible: boolean;
  wordData: WordData | null;
  isFavorited: boolean;
  isLoading: boolean;
  tags?: string[];
}

// Popup event types
export type PopupEventType = 
  | 'favorite'
  | 'unfavorite'
  | 'playAudio'
  | 'close'
  | 'loginRequired'
  | 'addTag'
  | 'removeTag';

// Popup event handler
export type PopupEventHandler = (event: PopupEventType, data?: any) => void;

// Popup configuration
export interface WordPopupConfig {
  /** Enable favorite button */
  enableFavorite: boolean;
  /** Enable audio playback */
  enableAudio: boolean;
  /** Enable tag management */
  enableTags: boolean;
  /** Maximum examples to show */
  maxExamples: number;
  /** Popup z-index */
  zIndex: number;
}

// Default popup configuration
export const DEFAULT_POPUP_CONFIG: WordPopupConfig = {
  enableFavorite: true,
  enableAudio: true,
  enableTags: true,
  maxExamples: 3,
  zIndex: 2147483647,
};
