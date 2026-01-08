/**
 * Feature Gate Service
 * Controls feature access based on user subscription status
 * 
 * Requirements: 3.2, 4.2, 5.1, 6.2, 7.1, 8.1, 9.2, 10.1-10.7
 */

import { subscriptionService } from './SubscriptionService';
import type {
  FeatureName,
  OptionType,
  UsageType,
  UsageLimitResult,
  PlanFeatures,
  FeatureAccessResult,
  OptionValueResult,
} from './types';

/**
 * Mapping of feature names to their location in PlanFeatures
 */
interface FeatureMapping {
  category: keyof PlanFeatures;
  property: string;
}

const FEATURE_MAPPINGS: Record<FeatureName, FeatureMapping> = {
  // Pronunciation features
  aiDefinition: { category: 'pronunciation', property: 'aiDefinition' },
  youdaoTTS: { category: 'pronunciation', property: 'youdaoTTS' },
  accentSwitch: { category: 'pronunciation', property: 'accentSwitch' },
  nestedTooltip: { category: 'pronunciation', property: 'nestedTooltip' },
  pronunciationHotkey: { category: 'pronunciation', property: 'hotkey' },
  
  // Vocabulary features
  vocabularyLists: { category: 'vocabulary', property: 'lists' },
  tags: { category: 'vocabulary', property: 'tags' },
  masteryLevel: { category: 'vocabulary', property: 'masteryLevel' },
  cloudSync: { category: 'vocabulary', property: 'cloudSync' },
  
  // Gamification features
  achievements: { category: 'gamification', property: 'achievements' },
  goals: { category: 'gamification', property: 'goals' },
  reminders: { category: 'gamification', property: 'reminders' },
  
  // Statistics features
  advancedStats: { category: 'statistics', property: 'advanced' },
  trends: { category: 'statistics', property: 'trends' },
  
  // Export features
  csvExport: { category: 'export', property: 'csv' },
  ankiExport: { category: 'export', property: 'anki' },
  
  // Website features
  whitelist: { category: 'website', property: 'whitelist' },
  
  // General features
  customCSS: { category: 'features', property: 'customCSS' },
  floatingBall: { category: 'features', property: 'floatingBall' },
  hotkeys: { category: 'features', property: 'hotkeys' },
  contextMenu: { category: 'features', property: 'contextMenu' },
  multiApi: { category: 'features', property: 'multiApi' },
  
  // Review features
  smartRecommend: { category: 'review', property: 'smartRecommend' },
  reviewPlan: { category: 'review', property: 'reviewPlan' },
  
  // Translation features
  positionControl: { category: 'translation', property: 'positionControl' },
  bracketControl: { category: 'translation', property: 'bracketControl' },
  lengthControl: { category: 'translation', property: 'lengthControl' },
};

/**
 * FeatureGateService class
 * Singleton service for controlling feature access based on subscription
 */
export class FeatureGateService {
  private static instance: FeatureGateService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): FeatureGateService {
    if (!FeatureGateService.instance) {
      FeatureGateService.instance = new FeatureGateService();
    }
    return FeatureGateService.instance;
  }

  // ==================== Core Methods ====================

  /**
   * Check if a feature is accessible for the current user
   * Requirements: 10.1-10.7
   * 
   * @param feature - The feature name to check
   * @returns Promise<boolean> - True if feature is accessible
   */
  public async canAccess(feature: FeatureName): Promise<boolean> {
    const result = await this.checkFeatureAccess(feature);
    return result.allowed;
  }

  /**
   * Check feature access with detailed result
   * 
   * @param feature - The feature name to check
   * @returns Promise<FeatureAccessResult> - Detailed access result
   */
  public async checkFeatureAccess(feature: FeatureName): Promise<FeatureAccessResult> {
    // 暂时开放所有功能给所有用户
    return { allowed: true };
  }

  /**
   * Check if user can perform an action based on usage limits
   * Requirements: 3.2, 4.2, 6.2, 9.2
   * 
   * @param usageType - The type of usage to check
   * @returns Promise<UsageLimitResult> - Usage limit result
   */
  public async canUse(usageType: UsageType): Promise<UsageLimitResult> {
    // 暂时不限制使用量
    return {
      allowed: true,
      current: 0,
      limit: 0,
      remaining: 0,
    };
  }

  /**
   * Get available options for a specific option type
   * Requirements: 5.1, 7.1, 8.1
   * 
   * @param optionType - The type of options to get
   * @returns Promise<string[]> - Array of available option values
   */
  public async getAvailableOptions(optionType: OptionType): Promise<string[]> {
    // 暂时返回所有可用选项
    return this.getAllOptions(optionType);
  }

  /**
   * Get all available options (premium level)
   */
  private getAllOptions(optionType: OptionType): string[] {
    switch (optionType) {
      case 'language':
        return ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'tr', 'el', 'ar', 'th', 'vi'];
      case 'style':
        return ['default', 'subtle', 'bold', 'italic', 'underlined', 'highlighted', 'learning', 'custom'];
      case 'level':
        return ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
      case 'ratio':
        return ['100'];
      default:
        return [];
    }
  }

  /**
   * Check if a specific value is allowed for an option type
   * Requirements: 5.1, 7.1, 8.1
   * 
   * @param optionType - The type of option
   * @param value - The value to check
   * @returns Promise<boolean> - True if value is allowed
   */
  public async isValueAllowed(optionType: OptionType, value: unknown): Promise<boolean> {
    // 暂时允许所有值
    return true;
  }

  /**
   * Check if a value is allowed with detailed result
   * 
   * @param optionType - The type of option
   * @param value - The value to check
   * @returns Promise<OptionValueResult> - Detailed result
   */
  public async checkValueAllowed(optionType: OptionType, value: unknown): Promise<OptionValueResult> {
    // 暂时允许所有值
    return { allowed: true };
  }

  // ==================== Helper Methods ====================

  /**
   * Get the maximum allowed ratio for the current user
   * Requirements: 5.1, 5.2
   * 
   * @returns Promise<number> - Maximum ratio percentage (1-100)
   */
  public async getMaxRatio(): Promise<number> {
    // 暂时返回最大值
    return 100;
  }

  /**
   * Get the daily translation limit for the current user
   * Requirements: 3.1, 3.4
   * 
   * @returns Promise<number> - Daily limit (0 = unlimited)
   */
  public async getDailyTranslationLimit(): Promise<number> {
    // 暂时返回无限制
    return 0;
  }

  /**
   * Get the maximum vocabulary collection limit
   * Requirements: 4.1, 4.3
   * 
   * @returns Promise<number> - Max words (0 = unlimited)
   */
  public async getMaxVocabularyLimit(): Promise<number> {
    // 暂时返回无限制
    return 0;
  }

  /**
   * Get the daily review limit
   * Requirements: 6.1, 6.3
   * 
   * @returns Promise<number> - Daily review limit
   */
  public async getDailyReviewLimit(): Promise<number> {
    // 暂时返回高限制
    return 200;
  }

  /**
   * Get the maximum website rules limit
   * Requirements: 9.1, 9.3
   * 
   * @returns Promise<number> - Max rules (0 = unlimited)
   */
  public async getMaxWebsiteRulesLimit(): Promise<number> {
    // 暂时返回无限制
    return 0;
  }

  /**
   * Check if user has premium subscription
   * 
   * @returns Promise<boolean> - True if premium
   */
  public async isPremium(): Promise<boolean> {
    // 暂时所有用户都视为高级用户
    return true;
  }

  /**
   * Get all features for the current user
   * 
   * @returns Promise<PlanFeatures | null> - Plan features or null
   */
  public async getFeatures(): Promise<PlanFeatures | null> {
    // 暂时返回所有功能开放的配置
    return {
      pronunciation: {
        webSpeechTTS: true,
        aiDefinition: true,
        youdaoTTS: true,
        accentSwitch: true,
        nestedTooltip: true,
        hotkey: true,
      },
      vocabulary: {
        lists: true,
        tags: true,
        masteryLevel: true,
        cloudSync: true,
        maxWords: 0, // 无限制
      },
      gamification: {
        achievements: true,
        goals: true,
        reminders: true,
      },
      statistics: {
        basic: true,
        advanced: true,
        trends: true,
      },
      export: {
        json: true,
        csv: true,
        anki: true,
        custom: true,
      },
      website: {
        whitelist: true,
        maxRules: 0, // 无限制
      },
      features: {
        customCSS: true,
        floatingBall: true,
        hotkeys: true,
        contextMenu: true,
        multiApi: true,
      },
      review: {
        smartRecommend: true,
        reviewPlan: true,
        dailyLimit: 200,
      },
      translation: {
        positionControl: true,
        bracketControl: true,
        lengthControl: true,
        dailyLimit: 0, // 无限制
        maxRatio: 100,
        languages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'tr', 'el', 'ar', 'th', 'vi'],
        styles: ['default', 'subtle', 'bold', 'italic', 'underlined', 'highlighted', 'learning', 'custom'],
        levels: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
      },
    };
  }

  // ==================== Private Helper Methods ====================

  /**
   * Get default free tier options for an option type
   */
  private getDefaultFreeOptions(optionType: OptionType): string[] {
    switch (optionType) {
      case 'language':
        return ['zh', 'en', 'ja', 'ko', 'es'];
      case 'style':
        return ['default', 'subtle', 'bold'];
      case 'level':
        return ['a1', 'b1', 'b2'];
      case 'ratio':
        return ['30'];
      default:
        return [];
    }
  }

  /**
   * Check value against default free tier limits
   */
  private checkAgainstDefaults(optionType: OptionType, value: unknown): OptionValueResult {
    const defaults = this.getDefaultFreeOptions(optionType);
    
    switch (optionType) {
      case 'ratio':
        const ratioValue = typeof value === 'number' ? value : Number(value);
        return {
          allowed: !isNaN(ratioValue) && ratioValue >= 1 && ratioValue <= 30,
          maxValue: 30,
        };
      
      default:
        return {
          allowed: defaults.includes(String(value)),
          availableOptions: defaults,
        };
    }
  }
}

// Export singleton instance
export const featureGateService = FeatureGateService.getInstance();

export default FeatureGateService;
