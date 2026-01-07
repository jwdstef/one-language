/**
 * 工具提示样式
 * 包含工具提示相关的所有样式定义，支持亮色/深色主题
 * 默认亮色主题，深色主题通过 @media (prefers-color-scheme: dark) 切换
 */

export const TOOLTIP_STYLES = `
/* ===== 亮色主题（默认） ===== */
.wxt-pronunciation-tooltip {
  position: fixed;
  z-index: 10000;
  pointer-events: auto;
  animation: wxt-tooltip-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
}

@keyframes wxt-tooltip-appear {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.wxt-tooltip-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0;
  min-width: 220px;
  max-width: 300px;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: visible;
}

.wxt-tooltip-header {
  background: #f9fafb;
  padding: 14px 14px 10px 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  border-radius: 14px 14px 0 0;
}

.wxt-phrase-tooltip-header {
  align-items: flex-start;
  gap: 12px;
}

.wxt-tooltip-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 14px;
  right: 14px;
  height: 1px;
  background: #e5e7eb;
}

.wxt-tooltip-body { font-size: 12px; }
.wxt-phrase-tooltip-body { padding: 8px 14px 12px 14px; }

.wxt-phrase-words {
  padding: 6px 8px;
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin: 0;
  position: relative;
  min-height: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
}

.wxt-word-info { flex: 1; min-width: 0; }

.wxt-word-main {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0;
  word-break: break-word;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.wxt-phonetic-row {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
}

.wxt-phonetic-text {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #6366f1;
  font-weight: 600;
  background: #eef2ff;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid #c7d2fe;
}

.wxt-phonetic-error {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #ef4444;
  font-style: italic;
  font-weight: 500;
  background: #fef2f2;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid #fecaca;
}

.wxt-word-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.wxt-word-title-row .wxt-word-main { flex: 1; }
.wxt-word-title-row .wxt-accent-buttons { flex-shrink: 0; }

.wxt-audio-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.wxt-audio-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.wxt-audio-btn svg { width: 14px; height: 14px; }

/* 工具提示箭头 - 默认显示在下方（箭头指向上方的单词） */
.wxt-tooltip-arrow {
  position: absolute;
  bottom: -8px;
  width: 14px;
  height: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-left: none;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 1;
}

/* 箭头显示在顶部（tooltip在单词下方时） */
.wxt-tooltip-arrow.wxt-tooltip-arrow-top {
  bottom: auto;
  top: -8px;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-right: none;
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}

/* 短语信息 */
.wxt-phrase-info-card { flex: 1; min-width: 0; }

.wxt-phrase-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.2;
}

.wxt-phrase-original {
  font-size: 10px;
  color: #6366f1;
  font-style: italic;
  background: #eef2ff;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #c7d2fe;
  display: inline-block;
  margin-top: 4px;
}

.wxt-phrase-audio-btn {
  width: 32px !important;
  height: 32px !important;
  flex-shrink: 0;
  align-self: flex-start;
}

.wxt-pronunciation-tooltip button,
.wxt-word-tooltip button {
  min-width: 20px !important;
  padding: 0 !important;
  margin: 0 !important;
}

.wxt-word-list { line-height: 1.6; padding: 3px 0; font-size: 11px; }

.wxt-interactive-word {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 5px;
  transition: all 0.2s ease;
  display: inline-block;
  margin: 2px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  font-weight: 500;
  font-size: 11px;
  line-height: 1.2;
}

.wxt-interactive-word:hover {
  background: #eef2ff;
  color: #6366f1;
  transform: translateY(-1px);
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

/* 单词悬浮框 */
.wxt-word-tooltip {
  position: fixed;
  z-index: 10001;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s ease;
  pointer-events: auto;
  animation: wxt-word-tooltip-appear 0.15s ease-out;
}

.wxt-word-tooltip[data-show="true"] {
  visibility: visible;
  opacity: 1;
}

@keyframes wxt-word-tooltip-appear {
  from { opacity: 0; transform: translateY(-4px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.wxt-word-tooltip-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
  color: #1f2937;
  font-size: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 220px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: visible;
}

.wxt-word-tooltip-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.wxt-word-tooltip-header .wxt-word-info { flex: 1; min-width: 0; }

.wxt-word-tooltip-header .wxt-word-main {
  font-weight: 700;
  font-size: 13px;
  color: #1f2937;
  margin-bottom: 0;
}

.wxt-word-tooltip-header .wxt-phonetic-row {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
}

.wxt-phonetic-container { display: flex; flex-direction: column; gap: 6px; }

.wxt-word-tooltip-header .wxt-phonetic-text {
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
  background: #eef2ff;
  padding: 4px 8px;
  border-radius: 5px;
  border: 1px solid #c7d2fe;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  text-align: center;
  margin-bottom: 3px;
}

.wxt-accent-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.wxt-accent-group { display: flex; align-items: center; gap: 4px; }

.wxt-accent-label {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  min-width: 14px;
  text-align: center;
  background: #f3f4f6;
  padding: 1px 4px;
  border-radius: 3px;
}

.wxt-accent-audio-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.25);
}

.wxt-accent-audio-btn:hover {
  transform: translateY(-1px) scale(1.1);
  box-shadow: 0 3px 8px rgba(99, 102, 241, 0.35);
}

/* 原文显示 */
.wxt-original-text {
  font-size: 10px;
  color: #6b7280;
  font-style: italic;
  margin: 6px 0 0 0;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.wxt-tooltip-header .wxt-original-text {
  margin: 6px 0 6px 0;
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #6366f1;
}

/* 词义容器 */
.wxt-meaning-container {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
  min-height: 20px;
  display: flex;
  align-items: center;
}

.wxt-meaning-text {
  font-size: 11px;
  color: #374151;
  line-height: 1.4;
  background: #f9fafb;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin: 0;
  font-style: italic;
  flex: 1;
}

.wxt-meaning-loading {
  font-size: 11px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: #f9fafb;
  border-radius: 5px;
  border: 1px solid #e5e7eb;
  font-style: italic;
  flex: 1;
}

.wxt-meaning-loading::after {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: wxt-spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes wxt-spin { to { transform: rotate(360deg); } }

.wxt-phonetic-loading {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  font-style: italic;
  margin-bottom: 4px;
}

.wxt-phonetic-loading::after {
  content: '';
  width: 10px;
  height: 10px;
  border: 2px solid transparent;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: wxt-spin 1s linear infinite;
  flex-shrink: 0;
}

.wxt-word-tooltip .wxt-meaning-container { margin-top: 6px; padding-top: 6px; min-height: 20px; }
.wxt-word-tooltip .wxt-meaning-text { font-size: 12px; padding: 6px 10px; }
.wxt-word-tooltip .wxt-meaning-loading { font-size: 11px; padding: 4px 8px; }
.wxt-word-tooltip .wxt-meaning-loading::after { width: 10px; height: 10px; }

/* 单词悬浮框箭头（嵌套tooltip） */
.wxt-word-tooltip .wxt-tooltip-arrow {
  position: absolute;
  bottom: -8px;
  width: 14px;
  height: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-top: none;
  border-left: none;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 1;
}

.wxt-word-tooltip .wxt-tooltip-arrow.wxt-tooltip-arrow-top {
  bottom: auto;
  top: -8px;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-right: none;
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}

/* ===== 深色主题 ===== */
/* 通过 .wxt-theme-dark 类触发深色主题 */
.wxt-theme-dark .wxt-tooltip-card {
  background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
  border-color: #48484a;
  color: #ffffff;
  box-shadow: 0 16px 32px -10px rgba(0, 0, 0, 0.4);
}

.wxt-theme-dark .wxt-tooltip-header {
  background: linear-gradient(135deg, rgba(58, 58, 60, 0.8) 0%, rgba(42, 42, 44, 0.9) 100%);
}

.wxt-theme-dark .wxt-tooltip-header::after { background: rgba(255, 255, 255, 0.08); }

.wxt-theme-dark .wxt-phrase-words {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
}

.wxt-theme-dark .wxt-word-main { color: #ffffff; }
.wxt-theme-dark .wxt-phonetic-row { border-top-color: rgba(255, 255, 255, 0.08); }

.wxt-theme-dark .wxt-phonetic-text {
  color: #64ffda;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%);
  border-color: rgba(100, 255, 218, 0.3);
}

.wxt-theme-dark .wxt-phonetic-error {
  color: #ff9999;
  background: rgba(255, 153, 153, 0.1);
  border-color: rgba(255, 153, 153, 0.3);
}

.wxt-theme-dark .wxt-audio-btn {
  background: linear-gradient(135deg, #64ffda 0%, #1de9b6 100%);
  color: #000000;
  box-shadow: 0 3px 10px rgba(100, 255, 218, 0.4);
}

.wxt-theme-dark .wxt-audio-btn:hover { box-shadow: 0 8px 20px rgba(100, 255, 218, 0.5); }

.wxt-theme-dark .wxt-tooltip-arrow {
  background: #1f2937;
  border-color: #48484a;
}

.wxt-theme-dark .wxt-tooltip-arrow.wxt-tooltip-arrow-top {
  background: #1f2937;
  border-color: #48484a;
}

.wxt-theme-dark .wxt-phrase-title { color: #ffffff; }

.wxt-theme-dark .wxt-phrase-original {
  color: #64ffda;
  background: rgba(100, 255, 218, 0.12);
  border-color: rgba(100, 255, 218, 0.2);
}

.wxt-theme-dark .wxt-interactive-word {
  color: #e5e5e7;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

.wxt-theme-dark .wxt-interactive-word:hover {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.4);
  box-shadow: 0 3px 12px rgba(52, 211, 153, 0.25);
}

.wxt-theme-dark .wxt-word-tooltip-card {
  background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
  border-color: #48484a;
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.wxt-theme-dark .wxt-word-tooltip-header .wxt-word-main { color: #ffffff; }
.wxt-theme-dark .wxt-word-tooltip-header .wxt-phonetic-row { border-top-color: rgba(255, 255, 255, 0.08); }

.wxt-theme-dark .wxt-word-tooltip-header .wxt-phonetic-text {
  color: #64ffda;
  background: rgba(100, 255, 218, 0.12);
  border-color: rgba(100, 255, 218, 0.25);
}

.wxt-theme-dark .wxt-accent-label {
  color: #a0a0a0;
  background: rgba(255, 255, 255, 0.08);
}

.wxt-theme-dark .wxt-accent-audio-btn {
  background: linear-gradient(135deg, #64ffda 0%, #1de9b6 100%);
  color: #000000;
  box-shadow: 0 2px 5px rgba(100, 255, 218, 0.25);
}

.wxt-theme-dark .wxt-accent-audio-btn:hover { box-shadow: 0 3px 8px rgba(100, 255, 218, 0.35); }

.wxt-theme-dark .wxt-original-text {
  color: #a0a0a0;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.wxt-theme-dark .wxt-tooltip-header .wxt-original-text {
  background: rgba(100, 255, 218, 0.08);
  border-color: rgba(100, 255, 218, 0.15);
  color: #64ffda;
}

.wxt-theme-dark .wxt-meaning-container { border-top-color: rgba(255, 255, 255, 0.08); }

.wxt-theme-dark .wxt-meaning-text {
  color: #e5e5e7;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.wxt-theme-dark .wxt-meaning-loading {
  color: #a0a0a0;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.wxt-theme-dark .wxt-meaning-loading::after { border-top-color: #64ffda; }

.wxt-theme-dark .wxt-phonetic-loading {
  color: #a0a0a0;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.wxt-theme-dark .wxt-phonetic-loading::after { border-top-color: #64ffda; }

/* 单词悬浮框箭头深色主题 */
.wxt-theme-dark .wxt-word-tooltip .wxt-tooltip-arrow {
  background: #1f2937;
  border-color: #48484a;
}

.wxt-theme-dark .wxt-word-tooltip .wxt-tooltip-arrow.wxt-tooltip-arrow-top {
  background: #1f2937;
  border-color: #48484a;
}

/* 响应式 */
@media (max-width: 480px) {
  .wxt-tooltip-card { min-width: 200px; max-width: 280px; }
  .wxt-tooltip-header { padding: 12px 12px 8px 12px; }
  .wxt-word-main { font-size: 13px; }
  .wxt-phonetic-text { font-size: 12px; }
  .wxt-audio-btn { width: 32px; height: 32px; }
  .wxt-audio-btn svg { width: 12px; height: 12px; }
}
`;
