/**
 * Plan Service
 * Manages subscription plans and their feature configurations
 */

import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// Define the SubscriptionPlan type based on the Prisma schema
interface SubscriptionPlanRecord {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  price: unknown; // Decimal type from Prisma
  duration: number;
  features: unknown; // JSON type from Prisma
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Plan features type definition based on design document
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

export type PlanName = 'free' | 'premium';

export interface PlanResponse {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  price: number;
  duration: number;
  features: PlanFeatures;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Convert Prisma SubscriptionPlan to PlanResponse
 */
function toPlanResponse(plan: SubscriptionPlanRecord): PlanResponse {
  return {
    id: plan.id,
    name: plan.name,
    displayName: plan.displayName,
    description: plan.description,
    price: Number(plan.price),
    duration: plan.duration,
    features: plan.features as unknown as PlanFeatures,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
  };
}

/**
 * Get all active subscription plans
 */
export async function getAllPlans(): Promise<PlanResponse[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return plans.map(toPlanResponse);
}

/**
 * Get a subscription plan by ID
 */
export async function getPlanById(planId: string): Promise<PlanResponse | null> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return null;
  }

  return toPlanResponse(plan);
}

/**
 * Get a subscription plan by name
 */
export async function getPlanByName(name: PlanName): Promise<PlanResponse | null> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { name },
  });

  if (!plan) {
    return null;
  }

  return toPlanResponse(plan);
}

/**
 * Get the features configuration for a plan
 */
export async function getPlanFeatures(planId: string): Promise<PlanFeatures> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new AppError('PLAN_NOT_FOUND', 'Subscription plan not found', 404);
  }

  return plan.features as unknown as PlanFeatures;
}

/**
 * Get the features configuration for a plan by name
 */
export async function getPlanFeaturesByName(name: PlanName): Promise<PlanFeatures> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { name },
  });

  if (!plan) {
    throw new AppError('PLAN_NOT_FOUND', `Subscription plan '${name}' not found`, 404);
  }

  return plan.features as unknown as PlanFeatures;
}

/**
 * Get the free plan (utility function)
 */
export async function getFreePlan(): Promise<PlanResponse> {
  const plan = await getPlanByName('free');
  if (!plan) {
    throw new AppError('PLAN_NOT_FOUND', 'Free plan not found', 404);
  }
  return plan;
}

/**
 * Get the premium plan (utility function)
 */
export async function getPremiumPlan(): Promise<PlanResponse> {
  const plan = await getPlanByName('premium');
  if (!plan) {
    throw new AppError('PLAN_NOT_FOUND', 'Premium plan not found', 404);
  }
  return plan;
}
