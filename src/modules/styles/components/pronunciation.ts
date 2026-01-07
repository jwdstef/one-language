/**
 * 发音功能样式
 * 包含发音功能相关的所有样式定义
 * 默认亮色主题
 */

export const PRONUNCIATION_STYLES = `
/* 发音功能样式 */
.wxt-pronunciation-enabled {
  position: relative;
  transition: all 0.2s ease;
}

.wxt-pronunciation-enabled:hover {
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 3px;
}

.wxt-pronunciation-loading {
  opacity: 0.7;
  position: relative;
}

.wxt-pronunciation-loading::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  top: -2px;
  right: -16px;
}

/* 注意：其他样式已移至 tooltip.ts 统一管理 */
`;
