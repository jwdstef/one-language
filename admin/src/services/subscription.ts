/**
 * Subscription Service for Admin Dashboard
 * Manages subscription status and feature gating
 * 
 * Requirements: 10.4, 10.5, 10.6, 10.7
 */

import { api } from './api';

// Types
export interface SubscriptionStatus {
  subscription: {
    id: string;
    plan: {
      id: string;
      name: 'free' | 'premium';
      displayName: string;
    };
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    isPremium: boolean;
  };
  features: PlanFeatures;
}

export interface PlanFeatures {
  translation: {
    dailyLimit: number;
    maxRatio: number;
    languages: string[];
    levels: string[];
    styles: string[];
    positionControl: boolean;
    bracketControl: boolean;
    lengthControl: boolean;
  };
  pronunciation: {
    webSpeechTTS: boolean;
    youdaoTTS: boolean;
    accentSwitch: boolean;
    aiDefinition: boolean;
    nestedTooltip: boolean;
    hotkey: boolean;
  };
  vocabulary: {
    maxWords: number;
    lists: boolean;
    tags: boolean;
    masteryLevel: boolean;
    cloudSync: boolean;
  };
  review: {
    dailyLimit: number;
    smartRecommend: boolean;
    reviewPlan: boolean;
  };
  website: {
    maxRules: number;
    whitelist: boolean;
  };
  features: {
    floatingBall: boolean;
    hotkeys: boolean;
    contextMenu: boolean;
    multiApi: boolean;
    customCSS: boolean;
  };
  gamification: {
    achievements: boolean;
    goals: boolean;
    reminders: boolean;
  };
  statistics: {
    basic: boolean;
    advanced: boolean;
    trends: boolean;
  };
  export: {
    json: boolean;
    csv: boolean;
    anki: boolean;
    custom: boolean;
  };
}

export interface UsageStatus {
  translation: UsageLimitResult;
  review: UsageLimitResult;
  collection: UsageLimitResult;
  website_rule: UsageLimitResult;
}

export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

// Cache for subscription status
let cachedStatus: SubscriptionStatus | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get subscription status with caching
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  const now = Date.now();
  
  // Return cached status if valid
  if (cachedStatus && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedStatus;
  }
  
  try {
    const response = await api.get('/subscription/status');
    if (response.data.success && response.data.data) {
      cachedStatus = response.data.data;
      cacheTimestamp = now;
      return cachedStatus;
    }
    return null;
  } catch (error) {
    console.error('[SubscriptionService] Failed to get status:', error);
    return cachedStatus; // Return cached data on error
  }
}

/**
 * Refresh subscription status (bypass cache)
 */
export async function refreshSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  cacheTimestamp = 0; // Invalidate cache
  return getSubscriptionStatus();
}

/**
 * Check if user has premium subscription
 */
export async function isPremium(): Promise<boolean> {
  const status = await getSubscriptionStatus();
  if (!status) return false;
  return status.subscription.isPremium && status.subscription.isActive;
}

/**
 * Get plan features
 */
export async function getFeatures(): Promise<PlanFeatures | null> {
  const status = await getSubscriptionStatus();
  if (!status) return null;
  return status.features;
}

/**
 * Check if a specific feature is available
 */
export async function canAccessFeature(feature: string): Promise<boolean> {
  const features = await getFeatures();
  if (!features) return false;
  
  // Map feature names to their location in PlanFeatures
  const featureMap: Record<string, () => boolean> = {
    // Gamification features
    achievements: () => features.gamification.achievements,
    goals: () => features.gamification.goals,
    reminders: () => features.gamification.reminders,
    
    // Statistics features
    advancedStats: () => features.statistics.advanced,
    trends: () => features.statistics.trends,
    basicStats: () => features.statistics.basic,
    
    // Export features
    csvExport: () => features.export.csv,
    ankiExport: () => features.export.anki,
    jsonExport: () => features.export.json,
    customExport: () => features.export.custom,
    
    // Other features
    floatingBall: () => features.features.floatingBall,
    vocabularyLists: () => features.vocabulary.lists,
    smartRecommend: () => features.review.smartRecommend,
  };
  
  const checker = featureMap[feature];
  if (checker) {
    return checker();
  }
  
  // Default to true for unknown features
  return true;
}

/**
 * Get usage status
 */
export async function getUsageStatus(): Promise<UsageStatus | null> {
  try {
    const response = await api.get('/subscription/usage');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('[SubscriptionService] Failed to get usage:', error);
    return null;
  }
}

/**
 * Invalidate cache
 */
export function invalidateCache(): void {
  cachedStatus = null;
  cacheTimestamp = 0;
}

// Export default object for convenience
export default {
  getSubscriptionStatus,
  refreshSubscriptionStatus,
  isPremium,
  getFeatures,
  canAccessFeature,
  getUsageStatus,
  invalidateCache,
};
