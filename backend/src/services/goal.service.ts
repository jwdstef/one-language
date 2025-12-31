import { prisma } from '../lib/prisma.js';

export interface UserGoal {
  dailyWordGoal: number;
  dailyReviewGoal: number;
  reminderEnabled: boolean;
  reminderTime: string | null;
}

export interface DailyProgress {
  wordsToday: number;
  reviewsToday: number;
  wordGoal: number;
  reviewGoal: number;
  wordProgress: number;
  reviewProgress: number;
  isWordGoalComplete: boolean;
  isReviewGoalComplete: boolean;
  isAllComplete: boolean;
}

// 获取用户目标设置
export async function getUserGoal(userId: string): Promise<UserGoal> {
  let goal = await prisma.userGoal.findUnique({
    where: { userId },
  });

  if (!goal) {
    // 创建默认目标
    goal = await prisma.userGoal.create({
      data: {
        userId,
        dailyWordGoal: 10,
        dailyReviewGoal: 20,
        reminderEnabled: false,
      },
    });
  }

  return {
    dailyWordGoal: goal.dailyWordGoal,
    dailyReviewGoal: goal.dailyReviewGoal,
    reminderEnabled: goal.reminderEnabled,
    reminderTime: goal.reminderTime,
  };
}

// 更新用户目标
export async function updateUserGoal(
  userId: string,
  data: Partial<UserGoal>
): Promise<UserGoal> {
  const goal = await prisma.userGoal.upsert({
    where: { userId },
    update: {
      dailyWordGoal: data.dailyWordGoal,
      dailyReviewGoal: data.dailyReviewGoal,
      reminderEnabled: data.reminderEnabled,
      reminderTime: data.reminderTime,
    },
    create: {
      userId,
      dailyWordGoal: data.dailyWordGoal || 10,
      dailyReviewGoal: data.dailyReviewGoal || 20,
      reminderEnabled: data.reminderEnabled || false,
      reminderTime: data.reminderTime,
    },
  });

  return {
    dailyWordGoal: goal.dailyWordGoal,
    dailyReviewGoal: goal.dailyReviewGoal,
    reminderEnabled: goal.reminderEnabled,
    reminderTime: goal.reminderTime,
  };
}

// 获取今日进度
export async function getDailyProgress(userId: string): Promise<DailyProgress> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [goal, wordsToday, reviewsToday] = await Promise.all([
    getUserGoal(userId),
    prisma.favoriteWord.count({
      where: {
        userId,
        favoritedAt: { gte: today },
      },
    }),
    prisma.learningActivity.count({
      where: {
        userId,
        activityType: 'review',
        createdAt: { gte: today },
      },
    }),
  ]);

  const wordProgress = Math.min(100, Math.round((wordsToday / goal.dailyWordGoal) * 100));
  const reviewProgress = Math.min(100, Math.round((reviewsToday / goal.dailyReviewGoal) * 100));

  return {
    wordsToday,
    reviewsToday,
    wordGoal: goal.dailyWordGoal,
    reviewGoal: goal.dailyReviewGoal,
    wordProgress,
    reviewProgress,
    isWordGoalComplete: wordsToday >= goal.dailyWordGoal,
    isReviewGoalComplete: reviewsToday >= goal.dailyReviewGoal,
    isAllComplete: wordsToday >= goal.dailyWordGoal && reviewsToday >= goal.dailyReviewGoal,
  };
}

// 获取今日学习统计
export async function getTodayStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [wordsToday, reviewsToday, streak] = await Promise.all([
    prisma.favoriteWord.count({
      where: {
        userId,
        favoritedAt: { gte: today },
      },
    }),
    prisma.learningActivity.count({
      where: {
        userId,
        activityType: 'review',
        createdAt: { gte: today },
      },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
    }),
  ]);

  // 检查今天是否已打卡
  const hasCheckedInToday = streak?.lastActivityDate 
    ? new Date(streak.lastActivityDate).toDateString() === new Date().toDateString()
    : false;

  return {
    wordsToday,
    reviewsToday,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    hasCheckedInToday,
  };
}
