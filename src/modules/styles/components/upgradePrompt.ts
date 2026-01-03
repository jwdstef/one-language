/**
 * Upgrade Prompt Styles
 * Styles for the upgrade prompt component
 * Requirements: 11.1, 11.2, 11.5
 */

export const UPGRADE_PROMPT_STYLES = `
/* Upgrade Prompt Container */
.wxt-upgrade-prompt {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10002;
  pointer-events: auto;
  animation: wxt-upgrade-prompt-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
  max-width: 360px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
}

@keyframes wxt-upgrade-prompt-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes wxt-upgrade-prompt-disappear {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}

.wxt-upgrade-prompt.wxt-upgrade-prompt--closing {
  animation: wxt-upgrade-prompt-disappear 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Prompt Card */
.wxt-upgrade-prompt-card {
  background: linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%);
  border: 1px solid #48484a;
  border-radius: 16px;
  box-shadow:
    0 16px 48px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(20px);
}

.wxt-upgrade-prompt-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}

/* Header */
.wxt-upgrade-prompt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 12px 16px;
  gap: 12px;
}

.wxt-upgrade-prompt-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.wxt-upgrade-prompt-icon svg {
  width: 22px;
  height: 22px;
  color: #1c1c1e;
}

.wxt-upgrade-prompt-title-section {
  flex: 1;
  min-width: 0;
}

.wxt-upgrade-prompt-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.wxt-upgrade-prompt-subtitle {
  font-size: 12px;
  color: #a0a0a0;
  margin: 0;
  line-height: 1.4;
}

.wxt-upgrade-prompt-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #a0a0a0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.wxt-upgrade-prompt-close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: scale(1.05);
}

.wxt-upgrade-prompt-close svg {
  width: 14px;
  height: 14px;
}

/* Body */
.wxt-upgrade-prompt-body {
  padding: 0 16px 16px 16px;
}

.wxt-upgrade-prompt-message {
  font-size: 13px;
  color: #e5e5e7;
  line-height: 1.5;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.wxt-upgrade-prompt-benefit {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64ffda;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(100, 255, 218, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%);
  border-radius: 8px;
  border: 1px solid rgba(100, 255, 218, 0.2);
}

.wxt-upgrade-prompt-benefit svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Actions */
.wxt-upgrade-prompt-actions {
  display: flex;
  gap: 10px;
}

.wxt-upgrade-prompt-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.wxt-upgrade-prompt-btn--primary {
  background: linear-gradient(135deg, #64ffda 0%, #1de9b6 100%);
  color: #000000;
  box-shadow:
    0 4px 12px rgba(100, 255, 218, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.wxt-upgrade-prompt-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(100, 255, 218, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.wxt-upgrade-prompt-btn--primary:active {
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(100, 255, 218, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.wxt-upgrade-prompt-btn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e5e7;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.wxt-upgrade-prompt-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}

/* Usage Stats */
.wxt-upgrade-prompt-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: #ff9999;
  margin-bottom: 12px;
  padding: 6px 10px;
  background: linear-gradient(135deg, rgba(255, 153, 153, 0.1) 0%, rgba(255, 153, 153, 0.05) 100%);
  border-radius: 6px;
  border: 1px solid rgba(255, 153, 153, 0.2);
}

.wxt-upgrade-prompt-stats-current {
  font-weight: 700;
}

.wxt-upgrade-prompt-stats-limit {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 480px) {
  .wxt-upgrade-prompt {
    bottom: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
  
  .wxt-upgrade-prompt-actions {
    flex-direction: column;
  }
}
`;
