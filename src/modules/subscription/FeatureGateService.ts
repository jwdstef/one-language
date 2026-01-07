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
    const features = await subscriptionService.getFeatures();
    
    // If no features available (not logged in), use default free tier features
    if (!features) {
      // Check if this is a free feature that should be allowed for unauthenticated users
      const freeFeatures: FeatureName[] = ['floatingBall']; // Features available to all users
      if (freeFeatures.includes(feature)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Not authenticated',
        upgradeRequired: true,
      };
    }

    const mapping = FEATURE_MAPPINGS[feature];
    if (!mapping) {
      console.warn(`[FeatureGateService] Unknown feature: ${feature}`);
      return { allowed: true }; // Allow unknown features by default
    }

    const categoryFeatures = features[mapping.category] as unknown as Record<string, unknown>;
    const isAllowed = Boolean(categoryFeatures[mapping.property]);

    return {
      allowed: isAllowed,
      reason: isAllowed ? undefined : `${feature} requires premium subscription`,
      upgradeRequired: !isAllowed,
    };
  }

  /**
   * Check if user can perform an action based on usage limits
   * Requirements: 3.2, 4.2, 6.2, 9.2
   * 
   * @param usageType - The type of usage to check
   * @returns Promise<UsageLimitResult> - Usage limit result
   */
  public async canUse(usageType: UsageType): Promise<UsageLimitResult> {
    const limitResult = await subscriptionService.checkUsageLimit(usageType);
    
    // If we can't check limits (not logged in), return a default allowing result
    if (!limitResult) {
      return {
        allowed: true,
        current: 0,
        limit: 0,
        remaining: 0,
      };
    }

    return limitResult;
  }

  /**
   * Get available options for a specific option type
   * Requirements: 5.1, 7.1, 8.1
   * 
   * @param optionType - The type of options to get
   * @returns Promise<string[]> - Array of available option values
   */
  public async getAvailableOptions(optionType: OptionType): Promise<string[]> {
    const features = await subscriptionService.getFeatures();
    
    if (!features) {
      // Return default free tier options if not authenticated
      return this.getDefaultFreeOptions(optionType);
    }

    switch (optionType) {
      case 'language':
        return features.translation.languages;
      case 'style':
        return features.translation.styles;
      case 'level':
        return features.translation.levels;
      case 'ratio':
        // For ratio, return the max value as a string array
        return [String(features.translation.maxRatio)];
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
    const result = await this.checkValueAllowed(optionType, value);
    return result.allowed;
  }

  /**
   * Check if a value is allowed with detailed result
   * 
   * @param optionType - The type of option
   * @param value - The value to check
   * @returns Promise<OptionValueResult> - Detailed result
   */
  public async checkValueAllowed(optionType: OptionType, value: unknown): Promise<OptionValueResult> {
    const features = await subscriptionService.getFeatures();
    
    if (!features) {
      // Use default free tier limits if not authenticated
      return this.checkAgainstDefaults(optionType, value);
    }

    switch (optionType) {
      case 'language':
        return {
          allowed: features.translation.languages.includes(String(value)),
          availableOptions: features.translation.languages,
        };
      
      case 'style':
        return {
          allowed: features.translation.styles.includes(String(value)),
          availableOptions: features.translation.styles,
        };
      
      case 'level':
        return {
          allowed: features.translation.levels.includes(String(value)),
          availableOptions: features.translation.levels,
        };
      
      case 'ratio':
        const ratioValue = typeof value === 'number' ? value : Number(value);
        const maxRatio = features.translation.maxRatio;
        return {
          allowed: !isNaN(ratioValue) && ratioValue >= 1 && ratioValue <= maxRatio,
          maxValue: maxRatio,
        };
      
      default:
        return { allowed: true };
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Get the maximum allowed ratio for the current user
   * Requirements: 5.1, 5.2
   * 
   * @returns Promise<number> - Maximum ratio percentage (1-100)
   */
  public async getMaxRatio(): Promise<number> {
    const features = await subscriptionService.getFeatures();
    if (!features) {
      return 30; // Default free tier max ratio
    }
    return features.translation.maxRatio;
  }

  /**
   * Get the daily translation limit for the current user
   * Requirements: 3.1, 3.4
   * 
   * @returns Promise<number> - Daily limit (0 = unlimited)
   */
  public async getDailyTranslationLimit(): Promise<number> {
    const features = await subscriptionService.getFeatures();
    if (!features) {
      return 100; // Default free tier limit
    }
    return features.translation.dailyLimit;
  }

  /**
   * Get the maximum vocabulary collection limit
   * Requirements: 4.1, 4.3
   * 
   * @returns Promise<number> - Max words (0 = unlimited)
   */
  public async getMaxVocabularyLimit(): Promise<number> {
    const features = await subscriptionService.getFeatures();
    if (!features) {
      return 100; // Default free tier limit
    }
    return features.vocabulary.maxWords;
  }

  /**
   * Get the daily review limit
   * Requirements: 6.1, 6.3
   * 
   * @returns Promise<number> - Daily review limit
   */
  public async getDailyReviewLimit(): Promise<number> {
    const features = await subscriptionService.getFeatures();
    if (!features) {
      return 20; // Default free tier limit
    }
    return features.review.dailyLimit;
  }

  /**
   * Get the maximum website rules limit
   * Requirements: 9.1, 9.3
   * 
   * @returns Promise<number> - Max rules (0 = unlimited)
   */
  public async getMaxWebsiteRulesLimit(): Promise<number> {
    const features = await subscriptionService.getFeatures();
    if (!features) {
      return 10; // Default free tier limit
    }
    return features.website.maxRules;
  }

  /**
   * Check if user has premium subscription
   * 
   * @returns Promise<boolean> - True if premium
   */
  public async isPremium(): Promise<boolean> {
    return subscriptionService.isPremium();
  }

  /**
   * Get all features for the current user
   * 
   * @returns Promise<PlanFeatures | null> - Plan features or null
   */
  public async getFeatures(): Promise<PlanFeatures | null> {
    return subscriptionService.getFeatures();
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
