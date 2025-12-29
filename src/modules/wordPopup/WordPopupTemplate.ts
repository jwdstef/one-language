/**
 * Word Popup Template
 * Contains HTML template and CSS styles for the word popup component
 * 
 * Requirements: 2.3, 2.4, 2.5, 2.6
 */

import type { WordData, Meaning, ExampleSentence } from './types';

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
  padding: 16px 16px 12px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
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
  max-height: 300px;
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

/* Word Title Section */
.wxt-word-title {
  flex: 1;
  min-width: 0;
}

.wxt-word-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 4px;
  word-break: break-word;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.wxt-word-phonetic {
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
  font-size: 13px;
  color: #64ffda;
  font-style: normal;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%);
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid rgba(100, 255, 218, 0.3);
  letter-spacing: 0.02em;
  box-shadow: 0 2px 6px rgba(100, 255, 218, 0.15);
}

/* Action Buttons */
.wxt-word-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.wxt-word-popup .wxt-audio-btn,
.wxt-word-popup .wxt-favorite-btn {
  background: linear-gradient(135deg, #64ffda 0%, #1de9b6 100%);
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000000;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 3px 10px rgba(100, 255, 218, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  min-width: 36px;
  padding: 0;
  margin: 0;
}

.wxt-word-popup .wxt-audio-btn::before,
.wxt-word-popup .wxt-favorite-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.wxt-word-popup .wxt-audio-btn:hover,
.wxt-word-popup .wxt-favorite-btn:hover {
  transform: translateY(-2px) scale(1.08);
  box-shadow:
    0 8px 20px rgba(100, 255, 218, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.wxt-word-popup .wxt-audio-btn:hover::before,
.wxt-word-popup .wxt-favorite-btn:hover::before {
  opacity: 1;
}

.wxt-word-popup .wxt-audio-btn:active,
.wxt-word-popup .wxt-favorite-btn:active {
  transform: translateY(-1px) scale(1.02);
  box-shadow:
    0 4px 12px rgba(100, 255, 218, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Favorite button active state */
.wxt-word-popup .wxt-favorite-btn--active {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  box-shadow:
    0 3px 10px rgba(255, 215, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.wxt-word-popup .wxt-favorite-btn--active:hover {
  box-shadow:
    0 8px 20px rgba(255, 215, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Meanings Section */
.wxt-word-meanings {
  margin-bottom: 12px;
}

.wxt-meaning-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.wxt-meaning-item:last-child {
  border-bottom: none;
}

.wxt-meaning-pos {
  font-size: 11px;
  font-weight: 600;
  color: #64ffda;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.12) 0%, rgba(52, 211, 153, 0.08) 100%);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  flex-shrink: 0;
  text-transform: lowercase;
}

.wxt-meaning-def {
  font-size: 14px;
  color: #e5e5e7;
  line-height: 1.5;
  flex: 1;
}

/* Examples Section */
.wxt-word-examples {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.wxt-examples-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0a0a0;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.wxt-word-examples-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wxt-example-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  position: relative;
}

.wxt-example-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent);
  border-radius: 8px 8px 0 0;
}

.wxt-example-sentence {
  font-size: 13px;
  color: #ffffff;
  line-height: 1.5;
  margin-bottom: 6px;
  font-style: italic;
}

.wxt-example-translation {
  font-size: 12px;
  color: #a0a0a0;
  line-height: 1.4;
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
  padding: 8px;
}

/* Tag Input Section - Requirements: 9.5 */
.wxt-word-tags {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.wxt-tags-title {
  font-size: 12px;
  font-weight: 600;
  color: #a0a0a0;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wxt-tags-title::before {
  content: '🏷️';
  font-size: 11px;
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
`;

/**
 * WordPopupTemplate class
 * Provides methods to generate HTML content for the word popup
 */
export class WordPopupTemplate {
  /**
   * Generate the complete popup HTML structure
   * Requirements: 2.3, 2.4, 2.5, 2.6, 9.5
   */
  public static getTemplate(enableAudio: boolean = true, enableFavorite: boolean = true, enableTags: boolean = true): string {
    return `
      <div class="wxt-word-popup-header">
        <div class="wxt-word-title">
          <span class="wxt-word-text"></span>
          <span class="wxt-word-phonetic"></span>
        </div>
        <div class="wxt-word-actions">
          ${enableAudio ? '<button class="wxt-audio-btn" title="播放发音">🔊</button>' : ''}
          ${enableFavorite ? '<button class="wxt-favorite-btn" title="收藏">☆</button>' : ''}
        </div>
      </div>
      
      <div class="wxt-word-popup-body">
        <div class="wxt-word-meanings"></div>
        
        <div class="wxt-word-examples">
          <div class="wxt-examples-title">例句</div>
          <div class="wxt-word-examples-list"></div>
        </div>
        
        ${enableTags ? `
        <div class="wxt-word-tags wxt-word-tags--hidden">
          <div class="wxt-tags-title">标签</div>
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
   * Render meanings section HTML
   * Requirements: 2.4
   */
  public static renderMeanings(meanings: Meaning[]): string {
    if (!meanings || meanings.length === 0) {
      return '<div class="wxt-empty-state">暂无释义</div>';
    }
    
    return meanings.map(meaning => `
      <div class="wxt-meaning-item">
        <span class="wxt-meaning-pos">${this.escapeHtml(meaning.partOfSpeech)}</span>
        <span class="wxt-meaning-def">${this.escapeHtml(meaning.definition)}</span>
      </div>
    `).join('');
  }

  /**
   * Render examples section HTML
   * Requirements: 2.5
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
   * Render pronunciation section HTML
   * Requirements: 2.3
   */
  public static renderPronunciation(phonetic: string): string {
    if (!phonetic) {
      return '';
    }
    return `<span class="wxt-word-phonetic">${this.escapeHtml(phonetic)}</span>`;
  }

  /**
   * Render tags section HTML
   * Requirements: 9.5
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
   * Generate complete popup content from WordData
   */
  public static renderContent(wordData: WordData, maxExamples: number = 3): {
    word: string;
    phonetic: string;
    meaningsHtml: string;
    examplesHtml: string;
  } {
    return {
      word: wordData.word,
      phonetic: wordData.pronunciation?.phonetic || '',
      meaningsHtml: this.renderMeanings(wordData.meanings),
      examplesHtml: this.renderExamples(wordData.exampleSentences, maxExamples),
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
