/**
 * Upgrade Prompt UI Component
 * Renders upgrade prompts in the DOM
 * 
 * Requirements: 11.1, 11.2, 11.5
 */

import { upgradePromptService } from './UpgradePromptService';
import type { UpgradeReason, UpgradePromptData, UpgradePromptContext } from './types';

/**
 * Localized messages for upgrade prompts
 */
interface PromptMessages {
  title: string;
  subtitle: string;
  message: string;
  benefit: string;
  upgradeButton: string;
  laterButton: string;
}

/**
 * Get localized messages for a specific upgrade reason
 */
function getPromptMessages(reason: UpgradeReason, context?: UpgradePromptContext): PromptMessages {
  // Default messages (English)
  const messages: Record<UpgradeReason, PromptMessages> = {
    translation_limit: {
      title: 'Daily Translation Limit Reached',
      subtitle: 'Upgrade to continue learning',
      message: 'You\'ve reached your daily translation limit. Premium users enjoy unlimited translations.',
      benefit: '✨ Unlimited daily translations',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    collection_limit: {
      title: 'Vocabulary Collection Full',
      subtitle: 'Expand your word bank',
      message: 'You\'ve reached the maximum vocabulary collection limit. Upgrade to save unlimited words.',
      benefit: '✨ Unlimited vocabulary storage',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    review_limit: {
      title: 'Daily Review Limit Reached',
      subtitle: 'Keep your learning momentum',
      message: 'You\'ve completed your daily reviews. Premium users can review up to 200 words per day.',
      benefit: '✨ 200 daily reviews',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    ratio_limit: {
      title: 'Translation Ratio Limited',
      subtitle: 'Unlock higher intensity',
      message: 'Free users can set translation ratio up to 30%. Upgrade for full control up to 100%.',
      benefit: '✨ Full translation ratio control',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    language_locked: {
      title: 'Language Locked',
      subtitle: 'Access more languages',
      message: `This language requires a premium subscription. Upgrade to access 20+ languages.`,
      benefit: '✨ 20+ supported languages',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    style_locked: {
      title: 'Style Locked',
      subtitle: 'Customize your experience',
      message: 'This translation style is a premium feature. Upgrade to access all styles and custom CSS.',
      benefit: '✨ All styles + custom CSS',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    level_locked: {
      title: 'Level Locked',
      subtitle: 'Access all proficiency levels',
      message: 'This proficiency level requires a premium subscription. Upgrade to access all levels.',
      benefit: '✨ All proficiency levels',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    feature_locked: {
      title: 'Premium Feature',
      subtitle: 'Unlock advanced features',
      message: context?.feature 
        ? `${context.feature} is a premium feature. Upgrade to unlock all advanced features.`
        : 'This feature requires a premium subscription.',
      benefit: '✨ All premium features',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
    rule_limit: {
      title: 'Website Rule Limit Reached',
      subtitle: 'Manage more websites',
      message: 'You\'ve reached the maximum website rules. Upgrade for unlimited rules and whitelist access.',
      benefit: '✨ Unlimited website rules',
      upgradeButton: 'Upgrade to Premium',
      laterButton: 'Later',
    },
  };

  return messages[reason] || messages.feature_locked;
}

/**
 * Get Chinese messages for upgrade prompts
 */
function getChineseMessages(reason: UpgradeReason, context?: UpgradePromptContext): PromptMessages {
  const messages: Record<UpgradeReason, PromptMessages> = {
    translation_limit: {
      title: '每日翻译次数已用完',
      subtitle: '升级以继续学习',
      message: '您已达到每日翻译限制。高级用户可享受无限翻译。',
      benefit: '✨ 无限每日翻译',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    collection_limit: {
      title: '词汇收藏已满',
      subtitle: '扩展您的词库',
      message: '您已达到词汇收藏上限。升级以保存无限单词。',
      benefit: '✨ 无限词汇存储',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    review_limit: {
      title: '每日复习次数已用完',
      subtitle: '保持学习动力',
      message: '您已完成今日复习。高级用户每天可复习200个单词。',
      benefit: '✨ 每日200次复习',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    ratio_limit: {
      title: '翻译比例受限',
      subtitle: '解锁更高强度',
      message: '免费用户翻译比例最高30%。升级后可完全控制，最高100%。',
      benefit: '✨ 完全控制翻译比例',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    language_locked: {
      title: '语言已锁定',
      subtitle: '访问更多语言',
      message: '此语言需要高级订阅。升级以访问20+种语言。',
      benefit: '✨ 20+种支持语言',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    style_locked: {
      title: '样式已锁定',
      subtitle: '自定义您的体验',
      message: '此翻译样式是高级功能。升级以访问所有样式和自定义CSS。',
      benefit: '✨ 所有样式 + 自定义CSS',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    level_locked: {
      title: '等级已锁定',
      subtitle: '访问所有掌握等级',
      message: '此掌握等级需要高级订阅。升级以访问所有等级。',
      benefit: '✨ 所有掌握等级',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    feature_locked: {
      title: '高级功能',
      subtitle: '解锁高级功能',
      message: context?.feature 
        ? `${context.feature}是高级功能。升级以解锁所有高级功能。`
        : '此功能需要高级订阅。',
      benefit: '✨ 所有高级功能',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
    rule_limit: {
      title: '网站规则数量已达上限',
      subtitle: '管理更多网站',
      message: '您已达到网站规则上限。升级以获得无限规则和白名单功能。',
      benefit: '✨ 无限网站规则',
      upgradeButton: '升级到高级版',
      laterButton: '稍后',
    },
  };

  return messages[reason] || messages.feature_locked;
}

/**
 * Detect user's language preference
 */
function detectLanguage(): 'zh' | 'en' {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

/**
 * Get messages based on detected language
 */
function getLocalizedMessages(reason: UpgradeReason, context?: UpgradePromptContext): PromptMessages {
  const lang = detectLanguage();
  if (lang === 'zh') {
    return getChineseMessages(reason, context);
  }
  return getPromptMessages(reason, context);
}

/**
 * SVG Icons
 */
const ICONS = {
  crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>`,
};

/**
 * UpgradePromptUI class
 * Manages the rendering and lifecycle of upgrade prompts
 */
export class UpgradePromptUI {
  private static instance: UpgradePromptUI;
  private container: HTMLElement | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): UpgradePromptUI {
    if (!UpgradePromptUI.instance) {
      UpgradePromptUI.instance = new UpgradePromptUI();
    }
    return UpgradePromptUI.instance;
  }

  /**
   * Initialize the UI component
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Listen for prompt events
    upgradePromptService.addPromptListener(this.handlePrompt.bind(this));
    upgradePromptService.addDismissListener(this.handleDismiss.bind(this));

    this.isInitialized = true;
    console.log('[UpgradePromptUI] Initialized');
  }

  /**
   * Handle prompt event
   */
  private handlePrompt(data: UpgradePromptData): void {
    this.render(data.reason, data.context);
  }

  /**
   * Handle dismiss event
   */
  private handleDismiss(): void {
    this.hide();
  }

  /**
   * Render the upgrade prompt
   */
  public render(reason: UpgradeReason, context?: UpgradePromptContext): void {
    // Remove existing prompt if any
    this.hide();

    const messages = getLocalizedMessages(reason, context);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'wxt-upgrade-prompt';
    this.container.setAttribute('role', 'dialog');
    this.container.setAttribute('aria-labelledby', 'wxt-upgrade-prompt-title');

    // Build HTML
    let statsHtml = '';
    if (context?.current !== undefined && context?.limit !== undefined) {
      statsHtml = `
        <div class="wxt-upgrade-prompt-stats">
          <span class="wxt-upgrade-prompt-stats-current">${context.current}</span>
          <span>/</span>
          <span class="wxt-upgrade-prompt-stats-limit">${context.limit}</span>
          <span>${detectLanguage() === 'zh' ? '已使用' : 'used'}</span>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="wxt-upgrade-prompt-card">
        <div class="wxt-upgrade-prompt-header">
          <div class="wxt-upgrade-prompt-icon">
            ${ICONS.crown}
          </div>
          <div class="wxt-upgrade-prompt-title-section">
            <h3 class="wxt-upgrade-prompt-title" id="wxt-upgrade-prompt-title">${messages.title}</h3>
            <p class="wxt-upgrade-prompt-subtitle">${messages.subtitle}</p>
          </div>
          <button class="wxt-upgrade-prompt-close" aria-label="Close" data-action="close">
            ${ICONS.close}
          </button>
        </div>
        <div class="wxt-upgrade-prompt-body">
          <p class="wxt-upgrade-prompt-message">${messages.message}</p>
          ${statsHtml}
          <div class="wxt-upgrade-prompt-benefit">
            ${ICONS.check}
            <span>${messages.benefit}</span>
          </div>
          <div class="wxt-upgrade-prompt-actions">
            <button class="wxt-upgrade-prompt-btn wxt-upgrade-prompt-btn--secondary" data-action="later">
              ${messages.laterButton}
            </button>
            <button class="wxt-upgrade-prompt-btn wxt-upgrade-prompt-btn--primary" data-action="upgrade">
              ${ICONS.sparkles}
              ${messages.upgradeButton}
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this.container.addEventListener('click', this.handleClick.bind(this));

    // Append to body
    document.body.appendChild(this.container);
  }

  /**
   * Handle click events
   */
  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest('[data-action]') as HTMLElement;
    
    if (!button) return;

    const action = button.dataset.action;

    switch (action) {
      case 'close':
      case 'later':
        this.dismiss();
        break;
      case 'upgrade':
        this.handleUpgrade();
        break;
    }
  }

  /**
   * Handle upgrade button click
   * Requirements: 11.5
   */
  private handleUpgrade(): void {
    // Open upgrade page in new tab
    // TODO: Update with actual upgrade URL when payment is implemented
    const upgradeUrl = 'https://admin.1zhizu.com/pricing';
    window.open(upgradeUrl, '_blank');
    
    // Dismiss the prompt
    this.dismiss();
  }

  /**
   * Dismiss the prompt
   */
  public dismiss(): void {
    upgradePromptService.dismissPrompt();
  }

  /**
   * Hide the prompt with animation
   */
  private hide(): void {
    if (!this.container) return;

    // Add closing animation class
    this.container.classList.add('wxt-upgrade-prompt--closing');

    // Remove after animation
    setTimeout(() => {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
      }
    }, 200);
  }

  /**
   * Check if prompt is currently visible
   */
  public isVisible(): boolean {
    return this.container !== null && this.container.parentNode !== null;
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.hide();
    upgradePromptService.removePromptListener(this.handlePrompt.bind(this));
    upgradePromptService.removeDismissListener(this.handleDismiss.bind(this));
    this.isInitialized = false;
  }
}

// Export singleton instance
export const upgradePromptUI = UpgradePromptUI.getInstance();

export default UpgradePromptUI;
