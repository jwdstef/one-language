/**
 * Word Popup Template
 * Contains HTML template and CSS styles for the word popup component
 * 
 * Requirements: 2.3, 2.4, 2.5, 2.6
 */

import type { WordData, Meaning, ExampleSentence, MorphologyAnalysis } from './types';

/**
 * SVG Icons for the popup
 * Expanded collection for rich UI
 */
const SVG_ICONS = {
  SPEAKER: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
  STAR_EMPTY: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  STAR_FILLED: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  CONTEXT: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  MEANING: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
  MORPHOLOGY: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  TAG: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
  ADD: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  CLOSE: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
};

/**
 * CSS styles for the word popup component
 * "Exquisite & Perfect" Light Theme Design
 */

export const WORD_POPUP_STYLES = `
/* Global Reset & Font */
.wxt-word-popup {
  position: absolute;
  z-index: 2147483647;
  pointer-events: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px) scale(0.98);
  transition: 
    opacity 0.2s ease-out,
    transform 0.25s ease-out,
    visibility 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  width: 380px;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.wxt-word-popup * {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

/* Visibility States */
.wxt-word-popup--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.wxt-word-popup--loading {
  pointer-events: none;
}

/* Loading Overlay */
.wxt-word-popup--loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 24px;
  z-index: 20;
}

/* Container Structure */
.wxt-word-popup-container {
  position: relative;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Decoration Background - subtle */
.wxt-card-bg-decoration,
.wxt-card-bg-decoration-2 {
  display: none;
}

/* Header Sections */
.wxt-word-header {
  padding: 16px 18px 12px;
  position: relative;
  z-index: 1;
  border-bottom: 1px solid #f3f4f6;
}

.wxt-word-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.wxt-word-title-wrapper {
  flex: 1;
  min-width: 0;
}

.wxt-word-text {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
  display: block;
}

/* Favorite Button */
.wxt-favorite-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
  flex-shrink: 0;
}

.wxt-favorite-btn:hover {
  background: #f3f4f6;
  color: #6366f1;
  border-color: #c7d2fe;
}

.wxt-favorite-btn--active {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #f59e0b;
}

/* Pronunciation */
.wxt-pronunciation-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.wxt-pronunciation-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px 2px 2px;
  border-radius: 16px;
  background: #f3f4f6;
  transition: all 0.15s ease;
}

.wxt-pronunciation-item:hover {
  background: #e5e7eb;
}

.wxt-pronunciation-audio-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #6366f1;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
}

.wxt-pronunciation-audio-btn:hover {
  background: #4f46e5;
  transform: scale(1.05);
}

.wxt-pronunciation-audio-btn svg {
  width: 12px;
  height: 12px;
}

.wxt-pronunciation-label {
  font-size: 9px;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
}

.wxt-pronunciation-phonetic {
  font-family: "SF Mono", "Menlo", "Consolas", monospace;
  font-size: 12px;
  color: #6b7280;
}

/* Body Content */
.wxt-word-popup-body {
  padding: 0;
  max-height: 360px;
  overflow-y: auto;
  color: #374151;
  position: relative;
  z-index: 1;
}

.wxt-word-popup-body::-webkit-scrollbar {
  width: 4px;
}

.wxt-word-popup-body::-webkit-scrollbar-track {
  background: transparent;
}

.wxt-word-popup-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

/* Section Common Styling */
.wxt-popup-section {
  padding: 12px 18px;
  border-bottom: 1px solid #f3f4f6;
}

.wxt-popup-section:last-child {
  border-bottom: none;
}

/* Section Header */
.wxt-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.wxt-section-icon {
  color: #6366f1;
  display: flex;
  align-items: center;
}

.wxt-section-icon svg {
  width: 12px;
  height: 12px;
}

.wxt-section-title {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Content: Context */
.wxt-context-box {
  background: #f9fafb;
  border-left: 3px solid #6366f1;
  border-radius: 8px;
  padding: 10px 12px;
}

.wxt-context-box::before {
  display: none;
}

.wxt-context-sentence {
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 6px;
}

.wxt-highlight-word {
  color: #4f46e5;
  font-weight: 600;
  background: #e0e7ff;
  padding: 0 4px;
  border-radius: 3px;
}

.wxt-context-translation {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  border-top: 1px solid #e5e7eb;
  padding-top: 6px;
  margin-top: 6px;
}

/* Content: Meanings */
.wxt-meaning-item {
  margin-bottom: 12px;
}

.wxt-meaning-item:last-child {
  margin-bottom: 0;
}

.wxt-meaning-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.wxt-meaning-pos {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.wxt-meaning-def {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  line-height: 1.4;
}

/* Examples Card */
.wxt-example-card {
  margin-top: 6px;
  padding: 8px 10px;
  background: #f9fafb;
  border-radius: 6px;
}

.wxt-example-en {
  font-size: 12px;
  color: #4b5563;
  font-style: italic;
  margin-bottom: 2px;
  line-height: 1.4;
}

.wxt-example-zh {
  font-size: 11px;
  color: #9ca3af;
}

/* Content: Morphology */
.wxt-morphology-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.wxt-morphology-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-width: 50px;
}

.wxt-morphology-chip::after {
  display: none;
}

.wxt-morphology-chip--prefix { border-left: 3px solid #f87171; }
.wxt-morphology-chip--root { border-left: 3px solid #34d399; }
.wxt-morphology-chip--suffix { border-left: 3px solid #818cf8; }

.wxt-morphology-text {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.wxt-morphology-meaning {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1px;
}

.wxt-morphology-separator {
  color: #d1d5db;
  font-size: 16px;
}

.wxt-morphology-etymology {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 8px;
  border-radius: 6px;
  line-height: 1.4;
}

/* Content: Tags */
.wxt-tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wxt-word-tags--hidden { display: none; }

.wxt-tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.wxt-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #6366f1;
  background: #eef2ff;
  border-radius: 12px;
}

.wxt-tag-remove {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #6366f1;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
}

.wxt-tag-remove svg { width: 8px; height: 8px; }

.wxt-tag-remove:hover {
  background: #ef4444;
  color: white;
}

.wxt-tag-input-row {
  display: flex;
  gap: 6px;
}

.wxt-tag-input {
  flex: 1;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #374151;
  outline: none;
}

.wxt-tag-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.wxt-tag-add-btn {
  width: 28px;
  height: 28px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.wxt-tag-add-btn:hover {
  background: #4f46e5;
}

/* Arrow */
.wxt-word-popup-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  transform: rotate(45deg);
  left: 50%;
  margin-left: -6px;
  z-index: -1;
}

.wxt-word-popup--arrow-top .wxt-word-popup-arrow {
  top: -6px;
  border-right: none;
  border-bottom: none;
}

.wxt-word-popup--arrow-bottom .wxt-word-popup-arrow {
  bottom: -6px;
  border-left: none;
  border-top: none;
}

/* Skeletons */
.wxt-skeleton {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: wxt-skeleton-loading 1.2s infinite;
  border-radius: 4px;
}

@keyframes wxt-skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.wxt-skeleton-phonetic { height: 20px; width: 60px; border-radius: 10px; }
.wxt-skeleton-meaning { height: 16px; width: 100%; margin-bottom: 8px; border-radius: 4px; }

/* Empty State */
.wxt-empty-state {
  text-align: center;
  padding: 20px 16px;
  color: #9ca3af;
  font-size: 13px;
}
`;


/**
 * WordPopupTemplate class
 * Provides methods to generate detailed HTML content for the word popup
 */
export class WordPopupTemplate {
  /**
   * Generate the complete popup HTML structure
   */
  public static getTemplate(enableAudio: boolean = true, enableFavorite: boolean = true, enableTags: boolean = true): string {
    return `<div class="wxt-word-popup-container">
  <div class="wxt-card-bg-decoration"></div>
  <div class="wxt-card-bg-decoration-2"></div>
  <div class="wxt-word-header">
    <div class="wxt-word-header-top">
      <div class="wxt-word-title-wrapper">
        <span class="wxt-word-text"></span>
        <div class="wxt-pronunciation-section"></div>
      </div>
      <div class="wxt-word-actions">
        ${enableFavorite ? `<button class="wxt-favorite-btn" title="收藏单词">${SVG_ICONS.STAR_EMPTY}</button>` : ''}
      </div>
    </div>
  </div>
  <div class="wxt-word-popup-body">
    <div class="wxt-popup-section wxt-context-section" style="display: none;">
      <div class="wxt-section-header">
        <span class="wxt-section-icon">${SVG_ICONS.CONTEXT}</span>
        <span class="wxt-section-title">语境</span>
      </div>
      <div class="wxt-context-box">
        <div class="wxt-context-sentence"></div>
        <div class="wxt-context-translation"></div>
      </div>
    </div>
    <div class="wxt-popup-section wxt-word-meanings">
      <div class="wxt-section-header">
        <span class="wxt-section-icon">${SVG_ICONS.MEANING}</span>
        <span class="wxt-section-title">释义</span>
      </div>
      <div class="wxt-meanings-list"></div>
    </div>
    <div class="wxt-popup-section wxt-morphology-section" style="display: none;">
      <div class="wxt-section-header">
        <span class="wxt-section-icon">${SVG_ICONS.MORPHOLOGY}</span>
        <span class="wxt-section-title">构词</span>
      </div>
      <div class="wxt-morphology-grid"></div>
    </div>
    ${enableTags ? `<div class="wxt-popup-section wxt-word-tags wxt-word-tags--hidden">
      <div class="wxt-section-header">
        <span class="wxt-section-icon">${SVG_ICONS.TAG}</span>
        <span class="wxt-section-title">标签</span>
      </div>
      <div class="wxt-tags-wrapper">
        <div class="wxt-tags-cloud"></div>
        <div class="wxt-tag-input-row">
          <input type="text" class="wxt-tag-input" placeholder="添加标签..." maxlength="30" />
          <button class="wxt-tag-add-btn" title="添加">${SVG_ICONS.ADD}</button>
        </div>
      </div>
    </div>` : ''}
  </div>
  <div class="wxt-word-popup-arrow"></div>
</div>`;
  }

  /**
   * Render pronunciation section with separate audio buttons
   */
  public static renderPronunciation(pronunciation: {
    usPhonetic?: string;
    ukPhonetic?: string;
    phonetic?: string;
    usAudioUrl?: string;
    ukAudioUrl?: string;
    audioUrl?: string;
  }): string {
    const items: string[] = [];

    // US pronunciation
    const usPhonetic = pronunciation.usPhonetic || pronunciation.phonetic || '';
    if (usPhonetic) {
      items.push(`<div class="wxt-pronunciation-item">
        <button class="wxt-pronunciation-audio-btn" data-accent="us" title="播放美式发音">${SVG_ICONS.SPEAKER}</button>
        <span class="wxt-pronunciation-label">US</span>
        <span class="wxt-pronunciation-phonetic">/${this.escapeHtml(usPhonetic)}/</span>
      </div>`);
    }

    // UK pronunciation
    const ukPhonetic = pronunciation.ukPhonetic || '';
    if (ukPhonetic && ukPhonetic !== usPhonetic) {
      items.push(`<div class="wxt-pronunciation-item">
        <button class="wxt-pronunciation-audio-btn" data-accent="uk" title="播放英式发音">${SVG_ICONS.SPEAKER}</button>
        <span class="wxt-pronunciation-label">UK</span>
        <span class="wxt-pronunciation-phonetic">/${this.escapeHtml(ukPhonetic)}/</span>
      </div>`);
    }

    // If no specific phonetics but we have audio, show generic speaker
    if (items.length === 0 && (pronunciation.audioUrl || pronunciation.phonetic)) {
      items.push(`<div class="wxt-pronunciation-item">
        ${pronunciation.audioUrl ? `<button class="wxt-pronunciation-audio-btn" data-accent="general" title="播放发音">${SVG_ICONS.SPEAKER}</button>` : ''}
        <span class="wxt-pronunciation-phonetic">/${this.escapeHtml(pronunciation.phonetic || '')}/</span>
      </div>`);
    }

    if (items.length === 0) {
      return `<div class="wxt-skeleton wxt-skeleton-phonetic"></div>`;
    }

    return items.join('');
  }

  /**
   * Render meanings list
   */
  public static renderMeanings(meanings: Meaning[]): string {
    if (!meanings || meanings.length === 0) {
      return `
        <div class="wxt-skeleton wxt-skeleton-meaning"></div>
        <div class="wxt-skeleton wxt-skeleton-meaning" style="width: 80%;"></div>
        <div class="wxt-skeleton wxt-skeleton-meaning" style="width: 60%;"></div>
      `;
    }

    return meanings.map(meaning => {
      const exampleHtml = meaning.example ? `
        <div class="wxt-example-card">
          <div class="wxt-example-en">${this.escapeHtml(meaning.example)}</div>
          ${meaning.exampleTranslation ? `<div class="wxt-example-zh">${this.escapeHtml(meaning.exampleTranslation)}</div>` : ''}
        </div>
      ` : '';

      return `
        <div class="wxt-meaning-item">
          <div class="wxt-meaning-header">
            ${meaning.partOfSpeech ? `<span class="wxt-meaning-pos">${this.escapeHtml(meaning.partOfSpeech)}</span>` : ''}
            <span class="wxt-meaning-def">${this.escapeHtml(meaning.definition)}</span>
          </div>
          ${exampleHtml}
        </div>
      `;
    }).join('');
  }

  /**
   * Render context sentence with highlighting
   */
  public static renderContext(sentence: string | undefined, translation: string | undefined, word: string): string {
    if (!sentence) return '';

    const escapedSentence = this.escapeHtml(sentence);
    const isChinese = /[\u4e00-\u9fa5]/.test(word);

    let highlightedSentence = escapedSentence;
    if (word && word.trim()) {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = isChinese
        ? new RegExp(`(${escapedWord})`, 'g')
        : new RegExp(`\\b(${escapedWord})\\b`, 'gi');

      highlightedSentence = escapedSentence.replace(regex, '<span class="wxt-highlight-word">$1</span>');
    }

    return `
      <div class="wxt-context-sentence">${highlightedSentence}</div>
      ${translation ? `<div class="wxt-context-translation">${this.escapeHtml(translation)}</div>` : ''}
    `;
  }

  /**
   * Render morphology chips
   */
  public static renderMorphology(morphology: MorphologyAnalysis | undefined): string {
    if (!morphology) return '';

    const parts: string[] = [];

    if (morphology.prefix) {
      parts.push(this.renderMorphPart(morphology.prefix, 'prefix'));
    }

    if (morphology.root) {
      if (parts.length > 0) parts.push('<span class="wxt-morphology-separator">+</span>');
      parts.push(this.renderMorphPart(morphology.root, 'root'));
    }

    if (morphology.suffix) {
      if (parts.length > 0) parts.push('<span class="wxt-morphology-separator">+</span>');
      parts.push(this.renderMorphPart(morphology.suffix, 'suffix'));
    }

    let html = parts.join('');
    if (morphology.etymology) {
      html += `<div class="wxt-morphology-etymology">${this.escapeHtml(morphology.etymology)}</div>`;
    }

    return html;
  }

  private static renderMorphPart(part: { text: string; meaning: string }, type: string): string {
    return `
      <div class="wxt-morphology-chip wxt-morphology-chip--${type}">
        <span class="wxt-morphology-text">${this.escapeHtml(part.text)}</span>
        <span class="wxt-morphology-meaning">${this.escapeHtml(part.meaning)}</span>
      </div>
    `;
  }

  /**
   * Render tag chips
   */
  public static renderTags(tags: string[]): string {
    if (!tags || tags.length === 0) return '';

    return tags.map(tag => `
      <span class="wxt-tag-chip">
        ${this.escapeHtml(tag)}
        <button class="wxt-tag-remove" data-tag="${this.escapeHtml(tag)}" title="移除标签">
          ${SVG_ICONS.CLOSE}
        </button>
      </span>
    `).join('');
  }

  public static renderContent(wordData: WordData, maxExamples: number = 3): {
    word: string;
    pronunciationHtml: string;
    meaningsHtml: string;
    morphologyHtml: string;
  } {
    return {
      word: wordData.word,
      pronunciationHtml: this.renderPronunciation(wordData.pronunciation),
      meaningsHtml: this.renderMeanings(wordData.meanings),
      morphologyHtml: this.renderMorphology(wordData.morphology),
    };
  }

  private static escapeHtml(text: string): string {
    if (!text) return '';
    const htmlEntities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
  }
}
