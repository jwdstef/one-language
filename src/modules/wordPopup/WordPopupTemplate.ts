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
  transform: translateY(10px) scale(0.96);
  transition: 
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0.3s;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  width: 420px;
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.2)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
  perspective: 1000px;
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

/* Container Structure with Premium Glassmorphism */
.wxt-word-popup-container {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-bottom-color: rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 
    inset 0 0 0 1px rgba(255, 255, 255, 0.5), 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
}

/* Decoration Background - The "Wow" Factor */
.wxt-card-bg-decoration {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
}
.wxt-card-bg-decoration-2 {
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(30px);
}

/* Header Sections */
.wxt-word-header {
  padding: 24px 28px 20px;
  position: relative;
  z-index: 1;
}

.wxt-word-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.wxt-word-title-wrapper {
  flex: 1;
  min-width: 0;
}

.wxt-word-text {
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #1e1b4b; /* Dark Indigo */
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 10px;
  display: block;
  /* subtle gradient text */
  background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(67, 56, 202, 0.1);
}

/* Favorite Button */
.wxt-favorite-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.6);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.wxt-favorite-btn:hover {
  background: #ffffff;
  color: #6366f1;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.15);
  border-color: #e0e7ff;
}

.wxt-favorite-btn--active {
  background: #fffbeb;
  border-color: #fbbf24;
  color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

/* Pronunciation */
.wxt-pronunciation-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.wxt-pronunciation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 4px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.2s;
}

.wxt-pronunciation-item:hover {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.wxt-pronunciation-audio-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #eef2ff;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
}

.wxt-pronunciation-audio-btn:hover {
  background: #6366f1;
  color: #ffffff;
  transform: scale(1.1) rotate(-10deg);
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.wxt-pronunciation-audio-btn svg {
  width: 14px;
  height: 14px;
}

.wxt-pronunciation-label {
  font-size: 10px;
  font-weight: 800;
  color: #818cf8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.wxt-pronunciation-phonetic {
  font-family: "SF Mono", "Menlo", "Consolas", monospace;
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

/* Body Content */
.wxt-word-popup-body {
  padding: 0;
  max-height: 480px;
  overflow-y: overlay;
  color: #374151;
  position: relative;
  z-index: 1;
}

.wxt-word-popup-body::-webkit-scrollbar {
  width: 6px;
}
.wxt-word-popup-body::-webkit-scrollbar-track {
  background: transparent;
}
.wxt-word-popup-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

/* Section Common Styling */
.wxt-popup-section {
  padding: 20px 28px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.wxt-popup-section:last-child {
  border-bottom: none;
}

/* Section Header */
.wxt-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.wxt-section-icon {
  color: #0f766e;
  padding: 4px;
  background: rgba(20, 184, 166, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.wxt-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Content: Context - Highlighted Style */
.wxt-context-box {
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  border: 1px solid rgba(20, 184, 166, 0.15);
  border-left: 4px solid #0d9488;
  border-radius: 16px;
  padding: 16px 20px 16px 24px;
  position: relative;
  box-shadow: 0 10px 30px -10px rgba(13, 148, 136, 0.1);
}

.wxt-context-box::before {
  content: '"';
  position: absolute;
  top: 8px;
  left: 8px;
  font-family: Georgia, serif;
  font-size: 48px;
  background: linear-gradient(to bottom, rgba(13, 148, 136, 0.2), transparent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  pointer-events: none;
}

.wxt-context-sentence {
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  margin-bottom: 8px;
  position: relative;
  font-weight: 500;
}

.wxt-highlight-word {
  color: #0f766e;
  font-weight: 700;
  background: rgba(20, 184, 166, 0.15);
  padding: 1px 6px;
  border-radius: 6px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  display: inline-block;
  transform: skewX(-5deg);
}

.wxt-context-translation {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  border-top: 1px dashed rgba(0,0,0,0.06);
  padding-top: 8px;
}

/* Content: Meanings */
.wxt-meaning-item {
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 2px solid rgba(0,0,0,0.05);
}
.wxt-meaning-item:last-child {
  margin-bottom: 0;
}

.wxt-meaning-header {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.wxt-meaning-pos {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: lowercase;
  font-family: monospace;
  box-shadow: 0 1px 2px rgba(79, 70, 229, 0.05);
}

.wxt-meaning-def {
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.5;
  flex: 1;
}

/* Examples Card */
.wxt-example-card {
  margin-top: 10px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.wxt-example-en {
  font-size: 14px;
  color: #334155;
  font-style: italic;
  margin-bottom: 4px;
  line-height: 1.5;
}

.wxt-example-zh {
  font-size: 12px;
  color: #94a3b8;
}

/* Content: Morphology */
.wxt-morphology-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.wxt-morphology-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  min-width: 70px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}

.wxt-morphology-chip::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.wxt-morphology-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(0,0,0,0.06);
}

.wxt-morphology-chip--prefix::after { background: #fca5a5; }
.wxt-morphology-chip--root::after   { background: #5eead4; }
.wxt-morphology-chip--suffix::after { background: #a5b4fc; }

.wxt-morphology-text {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.wxt-morphology-meaning {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.wxt-morphology-separator {
  color: #cbd5e1;
  font-size: 20px;
  font-weight: 300;
}

.wxt-morphology-etymology {
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
  background: #f1f5f9;
  padding: 12px;
  border-radius: 12px;
  line-height: 1.6;
}

/* Content: Tags */
.wxt-tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wxt-word-tags--hidden { display: none; }

.wxt-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #0f766e;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  border: 1px solid #99f6e4;
  border-radius: 20px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(13, 148, 136, 0.05);
}

.wxt-tag-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.15);
}

.wxt-tag-remove {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.5);
  color: #0f766e;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 0;
}
.wxt-tag-remove svg { width: 8px; height: 8px; }

.wxt-tag-remove:hover {
  background: #ef4444;
  color: white;
}

.wxt-tag-input-row {
  display: flex;
  gap: 8px;
}

.wxt-tag-input {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: #334155;
  outline: none;
  transition: all 0.2s;
}

.wxt-tag-input:focus {
  background: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.wxt-tag-add-btn {
  width: 34px;
  height: 34px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.wxt-tag-add-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

/* Arrow */
.wxt-word-popup-arrow {
  position: absolute;
  width: 18px;
  height: 18px;
  background: #ffffff; /* Fallback */
  background: rgba(255, 255, 255, 0.85); /* Match container */
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transform: rotate(45deg);
  left: 50%;
  margin-left: -9px;
  z-index: -1;
  box-shadow: inherit; /* Inherit doesn't work well for arrow, use specific */
}

.wxt-word-popup--arrow-top .wxt-word-popup-arrow {
  top: -9px;
  border-right: none;
  border-bottom: none;
}

.wxt-word-popup--arrow-bottom .wxt-word-popup-arrow {
  bottom: -9px;
  border-left: none;
  border-top: none;
}

/* Skeletons */
.wxt-skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: wxt-skeleton-loading 1.5s infinite;
  border-radius: 6px;
}

@keyframes wxt-skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.wxt-skeleton-phonetic { height: 24px; width: 80px; border-radius: 12px; }
.wxt-skeleton-meaning { height: 20px; width: 100%; margin-bottom: 12px; border-radius: 6px; }

/* Empty State */
.wxt-empty-state {
  text-align: center;
  padding: 32px 24px;
  color: #94a3b8;
  font-style: italic;
  font-size: 14px;
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
    return `
  < div class="wxt-word-popup-container" >
    <!--Decoration Backgrounds-- >
      <div class="wxt-card-bg-decoration" > </div>
        < div class="wxt-card-bg-decoration-2" > </div>

          < !--Header: Word, Audio, Favorite-- >
            <div class="wxt-word-header" >
              <div class="wxt-word-header-top" >
                <div class="wxt-word-title-wrapper" >
                  <span class="wxt-word-text" > </span>
                    < div class="wxt-pronunciation-section" > </div>
                      </div>
                      < div class="wxt-word-actions" >
                        ${ enableFavorite ? `<button class="wxt-favorite-btn" title="收藏单词">${SVG_ICONS.STAR_EMPTY}</button>` : '' }
</div>
  </div>
  </div>

  < !--Body: Content Sections-- >
    <div class="wxt-word-popup-body" >
      <!--Context Section(语境强化)-- >
        <div class="wxt-popup-section wxt-context-section" style = "display: none;" >
          <div class="wxt-section-header" >
            <span class="wxt-section-icon" > ${ SVG_ICONS.CONTEXT } </span>
              < span class="wxt-section-title" > 语境 </span>
                </div>
                < div class="wxt-context-box" >
                  <div class="wxt-context-sentence" > </div>
                    < div class="wxt-context-translation" > </div>
                      </div>
                      </div>

                      < !--Meanings Section-- >
                        <div class="wxt-popup-section wxt-word-meanings" >
                          <div class="wxt-section-header" >
                            <span class="wxt-section-icon" > ${ SVG_ICONS.MEANING } </span>
                              < span class="wxt-section-title" > 释义 </span>
                                </div>
                                < div class="wxt-meanings-list" > </div>
                                  </div>

                                  < !--Morphology Section(构词分析)-- >
                                    <div class="wxt-popup-section wxt-morphology-section" style = "display: none;" >
                                      <div class="wxt-section-header" >
                                        <span class="wxt-section-icon" > ${ SVG_ICONS.MORPHOLOGY } </span>
                                          < span class="wxt-section-title" > 构词 </span>
                                            </div>
                                            < div class="wxt-morphology-grid" > </div>
                                              </div>

                                              < !--Tags Section-- >
                                                ${
                                                  enableTags ? `
          <div class="wxt-popup-section wxt-word-tags wxt-word-tags--hidden">
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
          </div>
          ` : ''
}
</div>
  </div>

  < div class="wxt-word-popup-arrow" > </div>
    `;
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
      items.push(`
    < div class="wxt-pronunciation-item" >
      <button class="wxt-pronunciation-audio-btn" data - accent="us" title = "播放美式发音" >
        ${ SVG_ICONS.SPEAKER }
</button>
  < span class="wxt-pronunciation-label" > US </span>
    < span class="wxt-pronunciation-phonetic" > /${this.escapeHtml(usPhonetic)}/ </span>
      </div>
        `);
    }

    // UK pronunciation
    const ukPhonetic = pronunciation.ukPhonetic || '';
    if (ukPhonetic && ukPhonetic !== usPhonetic) {
      items.push(`
      < div class="wxt-pronunciation-item" >
        <button class="wxt-pronunciation-audio-btn" data - accent="uk" title = "播放英式发音" >
          ${ SVG_ICONS.SPEAKER }
</button>
  < span class="wxt-pronunciation-label" > UK </span>
    < span class="wxt-pronunciation-phonetic" > /${this.escapeHtml(ukPhonetic)}/ </span>
      </div>
        `);
    }

    // If no specific phonetics but we have audio, show generic speaker
    if (items.length === 0 && (pronunciation.audioUrl || pronunciation.phonetic)) {
      items.push(`
      < div class="wxt-pronunciation-item" >
        ${
          pronunciation.audioUrl ? `
          <button class="wxt-pronunciation-audio-btn" data-accent="general" title="播放发音">
            ${SVG_ICONS.SPEAKER}
          </button>` : ''
}
<span class="wxt-pronunciation-phonetic" > /${this.escapeHtml(pronunciation.phonetic || '')}/ </span>
  </div>
    `);
    }

    if (items.length === 0) {
      return `< div class="wxt-skeleton wxt-skeleton-phonetic" > </div>`;
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
