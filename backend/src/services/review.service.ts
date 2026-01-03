import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import * as subscriptionService from './subscription.service.js';
import type { MasteryLevel, Pronunciation, Meaning, ExampleSentence } from '../types/index.js';

export interface ReviewWordResponse {
  id: string;
  word: string;
  originalText: string | null;
  pronunciation: Pronunciation | null;
  meanings: Meaning[] | null;
  exampleSentences: ExampleSentence[] | null;
  masteryLevel: MasteryLevel;
  reviewCount: number;
  lastReviewedAt: Date | null;
  nextReviewAt: Date;
  dueScore: number;
}

export interface ReviewResult {
  wordId: string;
  known: boolean;
  previousMasteryLevel: MasteryLevel;
  newMasteryLevel: MasteryLevel;
  nextReviewAt: Date;
}

export interface ReviewProgress {
  totalWords: number;
  masteryDistribution: {
    new: number;
    learning: number;
    familiar: number;
    mastered: number;
  };
  dueForReview: number;
  reviewedToday: number;
  averageMasteryScore: number;
}

interface WordWithScore extends ReviewWordResponse {
  isDue: boolean;
}

// Spaced repetition intervals in days based on mastery level
const REVIEW_INTERVALS: Record<MasteryLevel, number> = {
  new: 1,        // Review tomorrow
  learning: 3,   // Review in 3 days
  familiar: 7,   // Review in a week
  mastered: 30,  // Review in a month
};

// Mastery level progression
const MASTERY_PROGRESSION: Record<MasteryLevel, MasteryLevel> = {
  new: 'learning',
  learning: 'familiar',
  familiar: 'mastered',
  mastered: 'mastered',
};

// Mastery level regression (when marked as "needs review")
const MASTERY_REGRESSION: Record<MasteryLevel, MasteryLevel> = {
  new: 'new',
  learning: 'new',
  familiar: 'learning',
  mastered: 'familiar',
};

/**
 * Calculate the due score for a word based on mastery level and time since last review.
 * Higher score = more urgent to review.
 */
function calculateDueScore(
  masteryLevel: MasteryLevel,
  lastReviewedAt: Date | null,
  favoritedAt: Date
): number {
  const now = new Date();
  const referenceDate = lastReviewedAt || favoritedAt;
  const daysSinceReview = Math.floor(
    (now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const interval = REVIEW_INTERVALS[masteryLevel];
  const overdueDays = daysSinceReview - interval;
  
  // Base score: lower mastery = higher priority
  const masteryScore: Record<MasteryLevel, number> = {
    new: 100,
    learning: 75,
    familiar: 50,
    mastered: 25,
  };
  
  // Add overdue bonus (10 points per overdue day, capped at 100)
  const overdueBonus = Math.min(Math.max(overdueDays * 10, 0), 100);
  
  return masteryScore[masteryLevel] + overdueBonus;
}

/**
 * Calculate the next review date based on mastery level.
 */
function calculateNextReviewDate(masteryLevel: MasteryLevel): Date {
  const now = new Date();
  const intervalDays = REVIEW_INTERVALS[masteryLevel];
  return new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}

/**
 * Get words that are due for review, ordered by priority.
 * Premium users get smart recommendations based on spaced repetition algorithm.
 * Free users get basic chronological ordering.
 * Requirements: 10.4 - Smart review recommendation gating
 */
export async function getDueWords(
  userId: string,
  limit: number = 20
): Promise<ReviewWordResponse[]> {
  const now = new Date();
  
  // Check if user has smart recommendation feature (Requirements: 10.4)
  const features = await subscriptionService.getUserFeatures(userId);
  const useSmartRecommend = features.review.smartRecommend;
  
  // Get all user's words
  const words = await prisma.favoriteWord.findMany({
    where: { userId },
    orderBy: [
      { masteryLevel: 'asc' }, // New words first
      { lastReviewedAt: 'asc' }, // Oldest reviewed first
      { favoritedAt: 'asc' }, // Oldest favorited first
    ],
  });
  
  // Calculate due scores and filter/sort
  const wordsWithScores: WordWithScore[] = words.map((word: {
    id: string;
    word: string;
    originalText: string | null;
    pronunciation: unknown;
    meanings: unknown;
    exampleSentences: unknown;
    masteryLevel: string;
    reviewCount: number;
    lastReviewedAt: Date | null;
    favoritedAt: Date;
  }) => {
    const masteryLevel = word.masteryLevel as MasteryLevel;
    
    // Calculate due score only for premium users with smart recommend
    const dueScore = useSmartRecommend 
      ? calculateDueScore(masteryLevel, word.lastReviewedAt, word.favoritedAt)
      : 0; // Basic mode: no scoring, use chronological order
    
    const nextReviewAt = word.lastReviewedAt
      ? new Date(
          word.lastReviewedAt.getTime() +
            REVIEW_INTERVALS[masteryLevel] * 24 * 60 * 60 * 1000
        )
      : word.favoritedAt;
    
    return {
      id: word.id,
      word: word.word,
      originalText: word.originalText,
      pronunciation: word.pronunciation as Pronunciation | null,
      meanings: word.meanings as Meaning[] | null,
      exampleSentences: word.exampleSentences as ExampleSentence[] | null,
      masteryLevel,
      reviewCount: word.reviewCount,
      lastReviewedAt: word.lastReviewedAt,
      nextReviewAt,
      dueScore,
      isDue: nextReviewAt <= now,
    };
  });
  
  // Filter and sort based on subscription tier
  let dueWords: WordWithScore[];
  
  if (useSmartRecommend) {
    // Premium: Smart recommendation - filter to due words and sort by score (highest first)
    dueWords = wordsWithScores
      .filter((w: WordWithScore) => w.isDue || w.masteryLevel === 'new')
      .sort((a: WordWithScore, b: WordWithScore) => b.dueScore - a.dueScore)
      .slice(0, limit);
  } else {
    // Free: Basic review - simple chronological order, prioritize new words
    dueWords = wordsWithScores
      .filter((w: WordWithScore) => w.isDue || w.masteryLevel === 'new')
      .sort((a: WordWithScore, b: WordWithScore) => {
        // Prioritize new words first
        if (a.masteryLevel === 'new' && b.masteryLevel !== 'new') return -1;
        if (b.masteryLevel === 'new' && a.masteryLevel !== 'new') return 1;
        // Then sort by last reviewed date (oldest first)
        const aDate = a.lastReviewedAt?.getTime() || 0;
        const bDate = b.lastReviewedAt?.getTime() || 0;
        return aDate - bDate;
      })
      .slice(0, limit);
  }
  
  // Remove isDue from response
  return dueWords.map(({ isDue: _isDue, ...word }) => word);
}

/**
 * Submit a review result for a word.
 */
export async function submitReview(
  userId: string,
  wordId: string,
  known: boolean
): Promise<ReviewResult> {
  const word = await prisma.favoriteWord.findFirst({
    where: { id: wordId, userId },
  });
  
  if (!word) {
    throw new AppError('VOCAB_NOT_FOUND', 'Word not found in collection', 404);
  }
  
  const previousMasteryLevel = word.masteryLevel as MasteryLevel;
  
  // Calculate new mastery level
  const newMasteryLevel = known
    ? MASTERY_PROGRESSION[previousMasteryLevel]
    : MASTERY_REGRESSION[previousMasteryLevel];
  
  const nextReviewAt = calculateNextReviewDate(newMasteryLevel);
  
  // Update the word
  await prisma.favoriteWord.update({
    where: { id: wordId },
    data: {
      masteryLevel: newMasteryLevel,
      reviewCount: { increment: 1 },
      lastReviewedAt: new Date(),
    },
  });
  
  // Record learning activity
  await prisma.learningActivity.create({
    data: {
      userId,
      activityType: 'review',
      wordId,
      metadata: {
        known,
        previousMasteryLevel,
        newMasteryLevel,
      },
    },
  });
  
  // Update streak
  await updateStreakForReview(userId);
  
  return {
    wordId,
    known,
    previousMasteryLevel,
    newMasteryLevel,
    nextReviewAt,
  };
}

/**
 * Get review progress statistics for a user.
 */
export async function getReviewProgress(userId: string): Promise<ReviewProgress> {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // Get all words for the user
  const words = await prisma.favoriteWord.findMany({
    where: { userId },
    select: {
      masteryLevel: true,
      lastReviewedAt: true,
      favoritedAt: true,
    },
  });
  
  // Calculate mastery distribution
  const masteryDistribution = {
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
  };
  
  let dueForReview = 0;
  
  for (const word of words) {
    const level = word.masteryLevel as MasteryLevel;
    masteryDistribution[level]++;
    
    // Check if due for review
    const nextReviewAt = word.lastReviewedAt
      ? new Date(
          word.lastReviewedAt.getTime() +
            REVIEW_INTERVALS[level] * 24 * 60 * 60 * 1000
        )
      : word.favoritedAt;
    
    if (nextReviewAt <= now || level === 'new') {
      dueForReview++;
    }
  }
  
  // Count reviews done today
  const reviewedToday = await prisma.learningActivity.count({
    where: {
      userId,
      activityType: 'review',
      createdAt: { gte: todayStart },
    },
  });
  
  // Calculate average mastery score (0-100)
  const masteryScores: Record<MasteryLevel, number> = {
    new: 0,
    learning: 33,
    familiar: 66,
    mastered: 100,
  };
  
  const totalWords = words.length;
  const averageMasteryScore =
    totalWords > 0
      ? words.reduce(
          (sum: number, w: { masteryLevel: string }) => 
            sum + masteryScores[w.masteryLevel as MasteryLevel],
          0
        ) / totalWords
      : 0;
  
  return {
    totalWords,
    masteryDistribution,
    dueForReview,
    reviewedToday,
    averageMasteryScore: Math.round(averageMasteryScore * 100) / 100,
  };
}

/**
 * Update user streak after a review activity.
 */
async function updateStreakForReview(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });
  
  if (!streak) {
    await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
      },
    });
    return;
  }
  
  const lastActivity = streak.lastActivityDate
    ? new Date(streak.lastActivityDate)
    : null;
  
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays === 0) {
      // Same day, no update needed
      return;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      const newStreak = streak.currentStreak + 1;
      await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastActivityDate: today,
        },
      });
    } else {
      // Gap in activity, reset streak
      await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActivityDate: today,
        },
      });
    }
  } else {
    // First activity
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastActivityDate: today,
      },
    });
  }
}
