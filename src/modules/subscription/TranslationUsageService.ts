/**
 * Translation Usage Service
 * Tracks and enforces translation usage limits based on subscription
 * 
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */

import { subscriptionService } from './SubscriptionService';
import { featureGateService } from './FeatureGateService';
import { upgradePromptService } from './UpgradePromptService';
import type { UsageLimitResult, TranslationLimitCheckResult } from './types';

export type { TranslationLimitCheckResult };

/**
 * TranslationUsageService class
 * Singleton service for tracking and enforcing translation limits
 */
export class TranslationUsageService {
  private static instance: TranslationUsageService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): TranslationUsageService {
    if (!TranslationUsageService.instance) {
      TranslationUsageService.instance = new TranslationUsageService();
    }
    return TranslationUsageService.instance;
  }

  /**
   * Check if translation is allowed before performing it
   * Requirements: 3.2, 3.4
   * 
   * @param paragraphCount - Number of paragraphs to translate (default 1)
   * @returns Promise<TranslationLimitCheckResult> - Result with limit info
   */
  public async checkTranslationAllowed(paragraphCount: number = 1): Promise<TranslationLimitCheckResult> {
    try {
      // Check if user is authenticated
      const isPremium = await subscriptionService.isPremium();
      
      // Get current usage limit status
      const limitResult = await featureGateService.canUse('translation');
      
      // If we can't get limit info (not logged in), allow translation
      if (!limitResult) {
        return {
          allowed: true,
          current: 0,
          limit: 0,
          remaining: Infinity,
          isPremium: false,
          message: undefined,
        };
      }

      // Premium users have unlimited translations (limit = 0 means unlimited)
      if (limitResult.limit === 0) {
        return {
          allowed: true,
          current: limitResult.current,
          limit: 0,
          remaining: Infinity,
          isPremium: true,
          message: undefined,
        };
      }

      // Check if adding paragraphCount would exceed limit
      const wouldExceed = (limitResult.current + paragraphCount) > limitResult.limit;
      const remaining = Math.max(0, limitResult.limit - limitResult.current);

      return {
        allowed: !wouldExceed && limitResult.allowed,
        current: limitResult.current,
        limit: limitResult.limit,
        remaining,
        isPremium,
        message: wouldExceed 
          ? `您今日的翻译配额已用完 (${limitResult.current}/${limitResult.limit})。升级到高级版可获得无限翻译。`
          : undefined,
      };
    } catch (error) {
      console.error('[TranslationUsageService] Error checking translation limit:', error);
      // On error, allow translation to avoid blocking user
      return {
        allowed: true,
        current: 0,
        limit: 0,
        remaining: Infinity,
        isPremium: false,
        message: undefined,
      };
    }
  }

  /**
   * Record translation usage after successful translation
   * Requirements: 3.1
   * 
   * @param paragraphCount - Number of paragraphs translated
   * @returns Promise<UsageLimitResult | null> - Updated usage info
   */
  public async recordTranslationUsage(paragraphCount: number = 1): Promise<UsageLimitResult | null> {
    try {
      console.log(`[TranslationUsageService] Recording translation usage: ${paragraphCount} paragraphs`);
      
      const result = await subscriptionService.recordUsage('translation', paragraphCount);
      
      if (result) {
        console.log('[TranslationUsageService] Usage recorded successfully:', result);
        if (!result.allowed) {
          console.log('[TranslationUsageService] Translation limit reached:', result);
        }
      } else {
        console.log('[TranslationUsageService] No result from recordUsage (user may not be logged in)');
      }
      
      return result;
    } catch (error) {
      console.error('[TranslationUsageService] Error recording translation usage:', error);
      return null;
    }
  }

  /**
   * Get current translation usage status
   * 
   * @returns Promise<UsageLimitResult | null> - Current usage info
   */
  public async getTranslationUsage(): Promise<UsageLimitResult | null> {
    try {
      return await featureGateService.canUse('translation');
    } catch (error) {
      console.error('[TranslationUsageService] Error getting translation usage:', error);
      return null;
    }
  }

  /**
   * Check if user has reached daily translation limit
   * Requirements: 3.2
   * 
   * @returns Promise<boolean> - True if limit reached
   */
  public async hasReachedDailyLimit(): Promise<boolean> {
    const result = await this.checkTranslationAllowed(1);
    return !result.allowed;
  }

  /**
   * Get remaining translations for today
   * 
   * @returns Promise<number> - Remaining count (Infinity for premium)
   */
  public async getRemainingTranslations(): Promise<number> {
    const result = await this.checkTranslationAllowed(0);
    return result.remaining;
  }

  /**
   * Show upgrade prompt when translation limit is reached
   * Requirements: 3.5
   * 
   * @param result - The translation limit check result
   */
  public async showLimitReachedPrompt(result: TranslationLimitCheckResult): Promise<void> {
    if (!result.allowed && !result.isPremium) {
      await upgradePromptService.showPrompt('translation_limit', {
        current: result.current,
        limit: result.limit,
        message: result.message,
      });
    }
  }
}

// Export singleton instance
export const translationUsageService = TranslationUsageService.getInstance();

export default TranslationUsageService;
