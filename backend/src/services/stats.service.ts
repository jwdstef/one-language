import { prisma } from '../lib/prisma.js';
import type { MasteryLevel } from '../types/index.js';

export interface UserOverview {
  totalWords: number;
  wordsThisWeek: number;
  wordsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  masteryDistribution: {
    new: number;
    learning: number;
    familiar: number;
    mastered: number;
  };
}

export interface DailyStats {
  date: string;
  wordsAdded: number;
  wordsReviewed: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalWordsAdded: number;
  totalWordsReviewed: number;
  dailyBreakdown: DailyStats[];
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakHistory: { date: string; active: boolean }[];
}

export async function getOverview(userId: string): Promise<UserOverview> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalWords, wordsThisWeek, wordsThisMonth, streak, masteryDistribution] =
    await Promise.all([
      // Total words
      prisma.favoriteWord.count({ where: { userId } }),

      // Words this week
      prisma.favoriteWord.count({
        where: {
          userId,
          favoritedAt: { gte: weekAgo },
        },
      }),

      // Words this month
      prisma.favoriteWord.count({
        where: {
          userId,
          favoritedAt: { gte: monthAgo },
        },
      }),

      // Streak info
      prisma.userStreak.findUnique({ where: { userId } }),

      // Mastery distribution
      prisma.favoriteWord.groupBy({
        by: ['masteryLevel'],
        where: { userId },
        _count: { masteryLevel: true },
      }),
    ]);

  // Convert mastery distribution to object
  const distribution: Record<MasteryLevel, number> = {
    new: 0,
    learning: 0,
    familiar: 0,
    mastered: 0,
  };

  for (const item of masteryDistribution) {
    const level = item.masteryLevel as MasteryLevel;
    if (level in distribution) {
      distribution[level] = item._count.masteryLevel;
    }
  }

  return {
    totalWords,
    wordsThisWeek,
    wordsThisMonth,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    masteryDistribution: distribution,
  };
}

export async function getDailyStats(
  userId: string,
  days: number = 30
): Promise<DailyStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get all activities in the date range
  const activities = await prisma.learningActivity.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: {
      activityType: true,
      createdAt: true,
    },
  });

  // Group by date
  const dailyMap = new Map<string, { wordsAdded: number; wordsReviewed: number }>();

  // Initialize all days
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { wordsAdded: 0, wordsReviewed: 0 });
  }

  // Count activities
  for (const activity of activities) {
    const dateStr = activity.createdAt.toISOString().split('T')[0];
    const stats = dailyMap.get(dateStr);
    if (stats) {
      if (activity.activityType === 'favorite') {
        stats.wordsAdded++;
      } else if (activity.activityType === 'review') {
        stats.wordsReviewed++;
      }
    }
  }

  // Convert to array
  return Array.from(dailyMap.entries())
    .map(([date, stats]) => ({
      date,
      ...stats,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getWeeklyStats(
  userId: string,
  weeks: number = 12
): Promise<WeeklyStats[]> {
  const dailyStats = await getDailyStats(userId, weeks * 7);

  const weeklyStats: WeeklyStats[] = [];
  let currentWeek: DailyStats[] = [];
  let weekStart: string | null = null;

  for (let i = 0; i < dailyStats.length; i++) {
    const day = dailyStats[i];
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      // Sunday - end of week
      currentWeek.push(day);
      weeklyStats.push({
        weekStart: weekStart!,
        weekEnd: day.date,
        totalWordsAdded: currentWeek.reduce((sum, d) => sum + d.wordsAdded, 0),
        totalWordsReviewed: currentWeek.reduce((sum, d) => sum + d.wordsReviewed, 0),
        dailyBreakdown: currentWeek,
      });
      currentWeek = [];
      weekStart = null;
    } else {
      if (weekStart === null) {
        weekStart = day.date;
      }
      currentWeek.push(day);
    }
  }

  // Handle remaining days
  if (currentWeek.length > 0 && weekStart) {
    weeklyStats.push({
      weekStart,
      weekEnd: currentWeek[currentWeek.length - 1].date,
      totalWordsAdded: currentWeek.reduce((sum, d) => sum + d.wordsAdded, 0),
      totalWordsReviewed: currentWeek.reduce((sum, d) => sum + d.wordsReviewed, 0),
      dailyBreakdown: currentWeek,
    });
  }

  return weeklyStats;
}

export async function getStreakInfo(userId: string): Promise<StreakInfo> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  // Get activity history for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activities = await prisma.learningActivity.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      createdAt: true,
    },
  });

  // Build streak history
  const activeDates = new Set(
    activities.map((a) => a.createdAt.toISOString().split('T')[0])
  );

  const streakHistory: { date: string; active: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    streakHistory.push({
      date: dateStr,
      active: activeDates.has(dateStr),
    });
  }

  return {
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    lastActivityDate: streak?.lastActivityDate?.toISOString().split('T')[0] || null,
    streakHistory,
  };
}
