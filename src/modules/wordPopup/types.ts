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
}

// Word meaning
export interface Meaning {
  partOfSpeech: string;
  definition: string;
  examples?: string[];
}

// Example sentence
export interface ExampleSentence {
  sentence: string;
  translation: string;
  source?: string;
}

// Complete word data for popup display
export interface WordData {
  word: string;
  originalText: string;
  pronunciation: Pronunciation;
  meanings: Meaning[];
  exampleSentences: ExampleSentence[];
  sourceUrl: string;
  context?: string;
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
