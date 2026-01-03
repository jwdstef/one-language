/**
 * Subscription Service
 * Manages user subscriptions, status tracking, and feature access
 */

import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import * as planService from './plan.service.js';
import { cacheService, CacheKeys, CacheTTL } from './cache.service.js';
import type { PlanFeatures } from './plan.service.js';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planDisplayName: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  features: PlanFeatures;
}

export interface SubscriptionResponse {
  id: string;
  plan: {
    id: string;
    name: string;
    displayName: string;
  };
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  isPremium: boolean;
}

export interface FullSubscriptionStatus {
  subscription: SubscriptionResponse;
  features: PlanFeatures;
}

/**
 * Invalidate all subscription-related cache for a user
 * Should be called when subscription status changes
 */
export function invalidateUserCache(userId: string): void {
  cacheService.delete(CacheKeys.subscriptionStatus(userId));
  cacheService.delete(CacheKeys.subscriptionFeatures(userId));
  cacheService.delete(CacheKeys.userUsage(userId));
}

/**
 * Get user's current active subscription
 * If no subscription exists, automatically creates a free subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  // Find active subscription
  let subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // If no active subscription, create free subscription
  if (!subscription) {
    const freePlan = await planService.getFreePlan();
    
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: 'active',
        startDate: new Date(),
        endDate: null, // Free plan is lifetime
      },
      include: {
        plan: true,
      },
    });

    subscription = newSubscription;
  }

  return {
    id: subscription.id,
    userId: subscription.userId,
    planId: subscription.planId,
    planName: subscription.plan.name,
    planDisplayName: subscription.plan.displayName,
    status: subscription.status as SubscriptionStatus,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    features: subscription.plan.features as unknown as PlanFeatures,
  };
}


/**
 * Create a new subscription (upgrade to premium)
 */
export async function createSubscription(
  userId: string,
  planId: string,
  durationDays?: number
): Promise<UserSubscription> {
  // Get the plan
  const plan = await planService.getPlanById(planId);
  if (!plan) {
    throw new AppError('PLAN_NOT_FOUND', 'Subscription plan not found', 404);
  }

  // Cancel any existing active subscriptions
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: 'active',
    },
    data: {
      status: 'cancelled',
    },
  });

  // Calculate end date
  const duration = durationDays ?? plan.duration;
  const endDate = duration > 0 
    ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
    : null; // null = lifetime

  // Create new subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      startDate: new Date(),
      endDate,
    },
    include: {
      plan: true,
    },
  });

  // Update user's subscription tier
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: plan.name },
  });

  // Invalidate cache for this user (Requirements: 12.5)
  invalidateUserCache(userId);

  return {
    id: subscription.id,
    userId: subscription.userId,
    planId: subscription.planId,
    planName: subscription.plan.name,
    planDisplayName: subscription.plan.displayName,
    status: subscription.status as SubscriptionStatus,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    features: subscription.plan.features as unknown as PlanFeatures,
  };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!subscription) {
    throw new AppError('SUBSCRIPTION_NOT_FOUND', 'Subscription not found', 404);
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'cancelled' },
  });

  // If this was the user's active subscription, create a free subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: subscription.userId,
      status: 'active',
    },
  });

  if (!activeSubscription) {
    const freePlan = await planService.getFreePlan();
    
    await prisma.subscription.create({
      data: {
        userId: subscription.userId,
        planId: freePlan.id,
        status: 'active',
        startDate: new Date(),
        endDate: null,
      },
    });

    // Update user's subscription tier to free
    await prisma.user.update({
      where: { id: subscription.userId },
      data: { subscriptionTier: 'free' },
    });
  }

  // Invalidate cache for this user (Requirements: 12.5)
  invalidateUserCache(subscription.userId);
}

/**
 * Check if user has an active subscription
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
  });

  if (!subscription) {
    return false;
  }

  // Check if subscription has expired
  if (subscription.endDate && subscription.endDate < new Date()) {
    return false;
  }

  return true;
}

/**
 * Check if user has premium subscription
 */
export async function isPremium(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription.planName === 'premium' && subscription.status === 'active';
}

/**
 * Get user's available features based on their subscription
 * Uses caching for performance (Requirements: 12.4)
 */
export async function getUserFeatures(userId: string): Promise<PlanFeatures> {
  // Check cache first
  const cacheKey = CacheKeys.subscriptionFeatures(userId);
  const cached = cacheService.get<PlanFeatures>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Fetch from database
  const subscription = await getUserSubscription(userId);
  const features = subscription.features;

  // Cache the result
  cacheService.set(cacheKey, features, CacheTTL.FEATURES);

  return features;
}

/**
 * Process expired subscriptions (to be called by a scheduled job)
 * Downgrades expired premium subscriptions to free
 */
export async function processExpiredSubscriptions(): Promise<number> {
  const now = new Date();

  // Find all expired active subscriptions
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      endDate: {
        lt: now,
        not: null,
      },
    },
    include: {
      plan: true,
    },
  });

  let processedCount = 0;

  for (const subscription of expiredSubscriptions) {
    // Mark as expired
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'expired' },
    });

    // Create free subscription for the user
    const freePlan = await planService.getFreePlan();
    
    await prisma.subscription.create({
      data: {
        userId: subscription.userId,
        planId: freePlan.id,
        status: 'active',
        startDate: new Date(),
        endDate: null,
      },
    });

    // Update user's subscription tier
    await prisma.user.update({
      where: { id: subscription.userId },
      data: { subscriptionTier: 'free' },
    });

    // Invalidate cache for this user (Requirements: 12.5)
    invalidateUserCache(subscription.userId);

    processedCount++;
  }

  return processedCount;
}

/**
 * Get subscription response for API
 */
export async function getSubscriptionResponse(userId: string): Promise<SubscriptionResponse> {
  const subscription = await getUserSubscription(userId);
  
  return {
    id: subscription.id,
    plan: {
      id: subscription.planId,
      name: subscription.planName,
      displayName: subscription.planDisplayName,
    },
    status: subscription.status,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    isActive: subscription.status === 'active',
    isPremium: subscription.planName === 'premium',
  };
}

/**
 * Get full subscription status including features and usage info
 * Uses caching for performance (Requirements: 12.4)
 */
export async function getFullSubscriptionStatus(userId: string): Promise<FullSubscriptionStatus> {
  // Check cache first
  const cacheKey = CacheKeys.subscriptionStatus(userId);
  const cached = cacheService.get<FullSubscriptionStatus>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Fetch from database
  const subscription = await getSubscriptionResponse(userId);
  const features = await getUserFeatures(userId);

  const result: FullSubscriptionStatus = {
    subscription,
    features,
  };

  // Cache the result
  cacheService.set(cacheKey, result, CacheTTL.SUBSCRIPTION_STATUS);

  return result;
}
