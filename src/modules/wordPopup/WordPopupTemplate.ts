/**
 * Word Popup Template
 * Contains HTML template and CSS styles for the word popup component
 * 
 * Requirements: 2.3, 2.4, 2.5, 2.6
 */

import type { WordData, Meaning, ExampleSentence, MorphologyAnalysis } from './types';

/**
 * SVG Icons for the popup
 */
const SVG_ICONS = {
  SPEAKER: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>`,
  STAR_EMPTY: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>`,
  STAR_FILLED: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>`,
};

/**
 * CSS styles for the word popup component
 * Follows the dark dictionary-style theme consistent with existing tooltip styles
 */
export const WORD_POPUP_STYLES = `
/* Word Popup Container */
.wxt-word-popup {
  position: absolute;
  z-index: 2147483647;
  pointer-events: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.96);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.25)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.06));
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  box-sizing: border-box;
}

.wxt-word-popup * {
  box-sizing: border-box;
}

.wxt-word-popup--visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.wxt-word-popup--loading {
  pointer-events: none;
}

.wxt-word-popup--loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(28, 28, 30, 0.8);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Popup Card */
.wxt-word-popup-header,
.wxt-word-popup-body {
  background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
  color: white;
}

.wxt-word-popup-header {
  border: 1px solid #48484a;
  border-bottom: none;
  border-radius: 14px 14px 0 0;
  padding: 16px;
  position: relative;
  background: linear-gradient(135deg, rgba(58, 58, 60, 0.8) 0%, rgba(42, 42, 44, 0.9) 100%);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.wxt-word-popup-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  border-radius: 14px 14px 0 0;
}

.wxt-word-popup-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
}

.wxt-word-popup-body {
  border: 1px solid #48484a;
  border-top: none;
  border-radius: 0 0 14px 14px;
  padding: 12px 16px 16px 16px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow:
    0 16px 32px -10px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Scrollbar styling */
.wxt-word-popup-body::-webkit-scrollbar {
  width: 6px;
}

.wxt-word-popup-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.wxt-word-popup-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.wxt-word-popup-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Header Top Row */
.wxt-word-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

/* Word Title Section */
.wxt-word-title {
  flex: 1;
  min-width: 0;
}

.wxt-word-text {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 2px;
  word-break: break-word;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Action Buttons */
.wxt-word-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.wxt-word-popup .wxt-favorite-btn {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #a0a0a0;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 36px;
  padding: 0;
  margin: 0;
}

.wxt-word-popup .wxt-favorite-btn:hover {
  transform: translateY(-2px) scale(1.08);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
  border-color: rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

/* Favorite button active state */
.wxt-word-popup .wxt-favorite-btn--active {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  border-color: transparent;
  color: #000;
  box-shadow: 0 3px 10px rgba(255, 215, 0, 0.4);
}

.wxt-word-popup .wxt-favorite-btn--active:hover {
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.5);
}

/* Pronunciation Section */
.wxt-pronunciation-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.wxt-pronunciation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.wxt-pronunciation-label {
  font-size: 11px;
  font-weight: 600;
  color: #64ffda;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wxt-pronunciation-phonetic {
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
  font-size: 13px;
  color: #e5e5e7;
  font-weight: 500;
}

.wxt-pronunciation-audio-btn {
  background: linear-gradient(135deg, #64ffda 0%, #1de9b6 100%);
  border: none;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000000;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  padding: 0;
}

.wxt-pronunciation-audio-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(100, 255, 218, 0.4);
}

.wxt-pronunciation-audio-btn:active {
  transform: scale(0.95);
}

.wxt-pronunciation-audio-btn svg {
  width: 14px;
  height: 14px;
}

/* Section Title */
.wxt-section-title {
  font-size: 11px;
  font-weight: 600;
  color: #64ffda;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wxt-section-title::before {
  content: '';
  width: 3px;
  height: 12px;
  background: linear-gradient(180deg, #64ffda 0%, #1de9b6 100%);
  border-radius: 2px;
}

/* Meanings Section */
.wxt-word-meanings {
  margin-bottom: 16px;
}

.wxt-meaning-item {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.wxt-meaning-item:last-child {
  border-bottom: none;
}

.wxt-meaning-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}

.wxt-meaning-pos {
  font-size: 11px;
  font-weight: 700;
  color: #64ffda;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.15) 0%, rgba(52, 211, 153, 0.1) 100%);
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(100, 255, 218, 0.25);
  flex-shrink: 0;
  text-transform: lowercase;
}

.wxt-meaning-def {
  font-size: 14px;
  color: #ffffff;
  line-height: 1.5;
  flex: 1;
}

.wxt-meaning-example {
  margin-top: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(100, 149, 237, 0.1) 0%, rgba(100, 149, 237, 0.05) 100%);
  border-radius: 8px;
  border-left: 3px solid #6495ed;
}

.wxt-meaning-example-en {
  font-size: 13px;
  color: #e5e5e7;
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 4px;
}

.wxt-meaning-example-zh {
  font-size: 12px;
  color: #a0a0a0;
  line-height: 1.4;
}

/* Morphology Section (构词分析) */
.wxt-morphology-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.wxt-morphology-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.wxt-morphology-part {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-width: 60px;
}

.wxt-morphology-part--prefix {
  border-color: rgba(255, 182, 193, 0.3);
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 182, 193, 0.05) 100%);
}

.wxt-morphology-part--root {
  border-color: rgba(100, 255, 218, 0.3);
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(100, 255, 218, 0.05) 100%);
}

.wxt-morphology-part--suffix {
  border-color: rgba(147, 112, 219, 0.3);
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.1) 0%, rgba(147, 112, 219, 0.05) 100%);
}

.wxt-morphology-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.wxt-morphology-meaning {
  font-size: 11px;
  color: #a0a0a0;
}

.wxt-morphology-plus {
  font-size: 16px;
  color: #64ffda;
  font-weight: 300;
}

.wxt-morphology-etymology {
  margin-top: 10px;
  font-size: 12px;
  color: #a0a0a0;
  line-height: 1.5;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

/* Arrow */
.wxt-word-popup-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
  border: 1px solid #48484a;
  transform: rotate(45deg);
  left: 50%;
  margin-left: -6px;
}

.wxt-word-popup--arrow-top .wxt-word-popup-arrow {
  top: -7px;
  border-right: none;
  border-bottom: none;
  background: linear-gradient(135deg, rgba(58, 58, 60, 0.8) 0%, rgba(42, 42, 44, 0.9) 100%);
}

.wxt-word-popup--arrow-bottom .wxt-word-popup-arrow {
  bottom: -7px;
  border-left: none;
  border-top: none;
}

/* Empty state */
.wxt-word-popup .wxt-empty-state {
  font-size: 13px;
  color: #a0a0a0;
  font-style: italic;
  text-align: center;
  padding: 12px;
}

/* Tag Input Section */
.wxt-word-tags {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.wxt-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.wxt-tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #64ffda;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.12) 0%, rgba(52, 211, 153, 0.08) 100%);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 12px;
  cursor: default;
  transition: all 0.2s ease;
}

.wxt-tag-item:hover {
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(52, 211, 153, 0.15) 100%);
}

.wxt-tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 10px;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.wxt-tag-remove:hover {
  background: rgba(255, 100, 100, 0.3);
  color: #ff6b6b;
}

.wxt-tag-input-wrapper {
  display: flex;
  gap: 6px;
}

.wxt-tag-input {
  flex: 1;
  padding: 6px 10px;
  font-size: 12px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

.wxt-tag-input::placeholder {
  color: #666;
}

.wxt-tag-input:focus {
  border-color: rgba(100, 255, 218, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.wxt-tag-add-btn {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #000;
  background: linear-gradient(135deg, #64ffda 0%, #1de9b6 100%);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wxt-tag-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 255, 218, 0.3);
}

.wxt-tag-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Hide tags section when not favorited */
.wxt-word-tags--hidden {
  display: none;
}

/* Loading skeleton */
.wxt-skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: wxt-skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes wxt-skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.wxt-skeleton-phonetic {
  height: 20px;
  width: 80px;
}

.wxt-skeleton-meaning {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}
`;


/**
 * WordPopupTemplate class
 * Provides methods to generate HTML content for the word popup
 */
export class WordPopupTemplate {
  /**
   * Generate the complete popup HTML structure
   */
  public static getTemplate(enableAudio: boolean = true, enableFavorite: boolean = true, enableTags: boolean = true): string {
    return `
      <div class="wxt-word-popup-header">
        <div class="wxt-word-header-top">
          <div class="wxt-word-title">
            <span class="wxt-word-text"></span>
          </div>
          <div class="wxt-word-actions">
            ${enableFavorite ? `<button class="wxt-favorite-btn" title="收藏">${SVG_ICONS.STAR_EMPTY}</button>` : ''}
          </div>
        </div>
        <div class="wxt-pronunciation-section"></div>
      </div>
      
      <div class="wxt-word-popup-body">
        <div class="wxt-word-meanings">
          <div class="wxt-section-title">释义</div>
          <div class="wxt-meanings-list"></div>
        </div>
        
        <div class="wxt-morphology-section" style="display: none;">
          <div class="wxt-section-title">构词分析</div>
          <div class="wxt-morphology-content"></div>
        </div>
        
        ${enableTags ? `
        <div class="wxt-word-tags wxt-word-tags--hidden">
          <div class="wxt-section-title">标签</div>
          <div class="wxt-tags-container"></div>
          <div class="wxt-tag-input-wrapper">
            <input type="text" class="wxt-tag-input" placeholder="添加标签..." maxlength="30" />
            <button class="wxt-tag-add-btn">添加</button>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="wxt-word-popup-arrow"></div>
    `;
  }

  /**
   * Render pronunciation section with US and UK phonetics
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
      items.push(`
        <div class="wxt-pronunciation-item">
          <span class="wxt-pronunciation-label">US</span>
          <span class="wxt-pronunciation-phonetic">${this.escapeHtml(usPhonetic)}</span>
          <button class="wxt-pronunciation-audio-btn" data-accent="us" title="播放美式发音">
            ${SVG_ICONS.SPEAKER}
          </button>
        </div>
      `);
    }
    
    // UK pronunciation
    const ukPhonetic = pronunciation.ukPhonetic || '';
    if (ukPhonetic && ukPhonetic !== usPhonetic) {
      items.push(`
        <div class="wxt-pronunciation-item">
          <span class="wxt-pronunciation-label">UK</span>
          <span class="wxt-pronunciation-phonetic">${this.escapeHtml(ukPhonetic)}</span>
          <button class="wxt-pronunciation-audio-btn" data-accent="uk" title="播放英式发音">
            ${SVG_ICONS.SPEAKER}
          </button>
        </div>
      `);
    }
    
    // If no phonetics available, show loading skeleton
    if (items.length === 0) {
      return `
        <div class="wxt-pronunciation-item">
          <div class="wxt-skeleton wxt-skeleton-phonetic"></div>
        </div>
      `;
    }
    
    return items.join('');
  }

  /**
   * Render meanings section HTML with examples
   */
  public static renderMeanings(meanings: Meaning[]): string {
    if (!meanings || meanings.length === 0) {
      return `
        <div class="wxt-skeleton wxt-skeleton-meaning"></div>
        <div class="wxt-skeleton wxt-skeleton-meaning" style="width: 80%;"></div>
      `;
    }
    
    return meanings.map(meaning => {
      const exampleHtml = meaning.example ? `
        <div class="wxt-meaning-example">
          <div class="wxt-meaning-example-en">${this.escapeHtml(meaning.example)}</div>
          ${meaning.exampleTranslation ? `<div class="wxt-meaning-example-zh">${this.escapeHtml(meaning.exampleTranslation)}</div>` : ''}
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
   * Render morphology analysis section (构词分析)
   */
  public static renderMorphology(morphology: MorphologyAnalysis | undefined): string {
    if (!morphology) return '';
    
    const parts: string[] = [];
    
    if (morphology.prefix) {
      parts.push(`
        <div class="wxt-morphology-part wxt-morphology-part--prefix">
          <span class="wxt-morphology-text">${this.escapeHtml(morphology.prefix.text)}</span>
          <span class="wxt-morphology-meaning">${this.escapeHtml(morphology.prefix.meaning)}</span>
        </div>
      `);
    }
    
    if (morphology.root) {
      if (parts.length > 0) parts.push('<span class="wxt-morphology-plus">+</span>');
      parts.push(`
        <div class="wxt-morphology-part wxt-morphology-part--root">
          <span class="wxt-morphology-text">${this.escapeHtml(morphology.root.text)}</span>
          <span class="wxt-morphology-meaning">${this.escapeHtml(morphology.root.meaning)}</span>
        </div>
      `);
    }
    
    if (morphology.suffix) {
      if (parts.length > 0) parts.push('<span class="wxt-morphology-plus">+</span>');
      parts.push(`
        <div class="wxt-morphology-part wxt-morphology-part--suffix">
          <span class="wxt-morphology-text">${this.escapeHtml(morphology.suffix.text)}</span>
          <span class="wxt-morphology-meaning">${this.escapeHtml(morphology.suffix.meaning)}</span>
        </div>
      `);
    }
    
    let html = parts.join('');
    
    if (morphology.etymology) {
      html += `<div class="wxt-morphology-etymology">${this.escapeHtml(morphology.etymology)}</div>`;
    }
    
    return html;
  }

  /**
   * Render tags section HTML
   */
  public static renderTags(tags: string[]): string {
    if (!tags || tags.length === 0) {
      return '';
    }
    
    return tags.map(tag => `
      <span class="wxt-tag-item">
        ${this.escapeHtml(tag)}
        <button class="wxt-tag-remove" data-tag="${this.escapeHtml(tag)}" title="移除标签">×</button>
      </span>
    `).join('');
  }

  /**
   * Render examples section HTML (legacy support)
   */
  public static renderExamples(examples: ExampleSentence[], maxExamples: number = 3): string {
    if (!examples || examples.length === 0) {
      return '<div class="wxt-empty-state">暂无例句</div>';
    }
    
    const limitedExamples = examples.slice(0, maxExamples);
    
    return limitedExamples.map(example => `
      <div class="wxt-example-item">
        <div class="wxt-example-sentence">${this.escapeHtml(example.sentence)}</div>
        <div class="wxt-example-translation">${this.escapeHtml(example.translation)}</div>
      </div>
    `).join('');
  }

  /**
   * Generate complete popup content from WordData
   */
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

  /**
   * Escape HTML special characters to prevent XSS
   */
  private static escapeHtml(text: string): string {
    if (!text) return '';
    
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    
    return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
  }
}
