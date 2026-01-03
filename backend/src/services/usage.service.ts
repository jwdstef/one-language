/**
 * Usage Service
 * Tracks and manages user usage for rate limiting and feature gating
 */

import { prisma } from '../lib/prisma.js';
import * as subscriptionService from './subscription.service.js';
import { cacheService, CacheKeys, CacheTTL } from './cache.service.js';

// Usage types that can be tracked
export type UsageType = 'translation' | 'review' | 'collection' | 'website_rule';

// Result of checking usage limits
export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

/**
 * Get today's date at midnight (UTC) for daily usage tracking
 */
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/**
 * Invalidate usage cache for a user
 * Should be called when usage is recorded
 */
export function invalidateUsageCache(userId: string): void {
  cacheService.delete(CacheKeys.userUsage(userId));
}

/**
 * Record usage for a user
 * Increments the usage count for the specified type
 */
export async function recordUsage(
  userId: string,
  type: UsageType,
  count: number = 1
): Promise<void> {
  const today = getTodayDate();

  // Upsert the usage record - create if not exists, increment if exists
  await prisma.usageRecord.upsert({
    where: {
      userId_type_date: {
        userId,
        type,
        date: today,
      },
    },
    create: {
      userId,
      type,
      date: today,
      count,
    },
    update: {
      count: {
        increment: count,
      },
    },
  });

  // Invalidate usage cache after recording (Requirements: 12.5)
  invalidateUsageCache(userId);
}

/**
 * Get today's usage count for a specific type
 */
export async function getTodayUsage(userId: string, type: UsageType): Promise<number> {
  const today = getTodayDate();

  const record = await prisma.usageRecord.findUnique({
    where: {
      userId_type_date: {
        userId,
        type,
        date: today,
      },
    },
  });

  return record?.count ?? 0;
}

/**
 * Get total usage count for a specific type (all time)
 * Used for non-daily limits like vocabulary collection
 */
export async function getTotalUsage(userId: string, type: UsageType): Promise<number> {
  // For collection type, count actual favorite words instead of usage records
  if (type === 'collection') {
    const count = await prisma.favoriteWord.count({
      where: { userId },
    });
    return count;
  }

  // For website_rule type, we need to count from a different source
  // For now, aggregate all usage records of this type
  if (type === 'website_rule') {
    const result = await prisma.usageRecord.aggregate({
      where: {
        userId,
        type,
      },
      _sum: {
        count: true,
      },
    });
    return result._sum.count ?? 0;
  }

  // For other types, return today's usage (they are daily limits)
  return getTodayUsage(userId, type);
}

/**
 * Get the limit for a specific usage type based on user's subscription
 */
async function getUsageLimit(userId: string, type: UsageType): Promise<number> {
  const features = await subscriptionService.getUserFeatures(userId);

  switch (type) {
    case 'translation':
      return features.translation.dailyLimit;
    case 'review':
      return features.review.dailyLimit;
    case 'collection':
      return features.vocabulary.maxWords;
    case 'website_rule':
      return features.website.maxRules;
    default:
      return 0;
  }
}

/**
 * Check if user has exceeded their usage limit
 * Returns detailed information about current usage and limits
 */
export async function checkLimit(
  userId: string,
  type: UsageType
): Promise<UsageLimitResult> {
  const limit = await getUsageLimit(userId, type);
  
  // Get current usage based on type
  let current: number;
  if (type === 'collection' || type === 'website_rule') {
    // These are total limits, not daily
    current = await getTotalUsage(userId, type);
  } else {
    // Translation and review are daily limits
    current = await getTodayUsage(userId, type);
  }

  // 0 limit means unlimited
  if (limit === 0) {
    return {
      allowed: true,
      current,
      limit: 0,
      remaining: Infinity,
    };
  }

  const remaining = Math.max(0, limit - current);
  const allowed = current < limit;

  return {
    allowed,
    current,
    limit,
    remaining,
  };
}

/**
 * Reset daily usage counts
 * This should be called by a scheduled job at midnight
 * Note: We don't actually delete records, we just rely on the date field
 * Old records can be cleaned up separately for analytics purposes
 */
export async function resetDailyUsage(): Promise<number> {
  // Delete old daily usage records (older than 30 days for cleanup)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cleanupDate = new Date(
    Date.UTC(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate())
  );

  const result = await prisma.usageRecord.deleteMany({
    where: {
      date: {
        lt: cleanupDate,
      },
      // Only delete daily limit types, keep total counts
      type: {
        in: ['translation', 'review'],
      },
    },
  });

  return result.count;
}

/**
 * Get all usage statistics for a user
 * Returns usage info for all tracked types
 * Uses caching for performance (Requirements: 12.4)
 */
export async function getAllUsage(userId: string): Promise<Record<UsageType, UsageLimitResult>> {
  // Check cache first
  const cacheKey = CacheKeys.userUsage(userId);
  const cached = cacheService.get<Record<UsageType, UsageLimitResult>>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Fetch from database
  const [translation, review, collection, websiteRule] = await Promise.all([
    checkLimit(userId, 'translation'),
    checkLimit(userId, 'review'),
    checkLimit(userId, 'collection'),
    checkLimit(userId, 'website_rule'),
  ]);

  const result = {
    translation,
    review,
    collection,
    website_rule: websiteRule,
  };

  // Cache the result (shorter TTL since usage changes frequently)
  cacheService.set(cacheKey, result, CacheTTL.USAGE);

  return result;
}

/**
 * Check if a specific operation is allowed before performing it
 * Convenience method that combines checkLimit with a boolean return
 */
export async function canPerformAction(userId: string, type: UsageType): Promise<boolean> {
  const result = await checkLimit(userId, type);
  return result.allowed;
}

/**
 * Record usage and check if the operation was within limits
 * Returns the updated usage status after recording
 */
export async function recordAndCheck(
  userId: string,
  type: UsageType,
  count: number = 1
): Promise<UsageLimitResult> {
  await recordUsage(userId, type, count);
  return checkLimit(userId, type);
}
