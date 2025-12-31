import { prisma } from '../lib/prisma.js';

// UserAchievement type (matches Prisma schema)
interface UserAchievementRecord {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

// 成就定义
export const ACHIEVEMENTS = {
  // 词汇量里程碑
  FIRST_WORD: { id: 'first_word', name: '初学者', description: '收藏第一个单词', icon: '🌱', category: 'vocabulary', threshold: 1 },
  WORDS_10: { id: 'words_10', name: '小有收获', description: '收藏10个单词', icon: '📚', category: 'vocabulary', threshold: 10 },
  WORDS_50: { id: 'words_50', name: '词汇新手', description: '收藏50个单词', icon: '📖', category: 'vocabulary', threshold: 50 },
  WORDS_100: { id: 'words_100', name: '百词斩', description: '收藏100个单词', icon: '💯', category: 'vocabulary', threshold: 100 },
  WORDS_500: { id: 'words_500', name: '词汇达人', description: '收藏500个单词', icon: '🏆', category: 'vocabulary', threshold: 500 },
  WORDS_1000: { id: 'words_1000', name: '词汇大师', description: '收藏1000个单词', icon: '👑', category: 'vocabulary', threshold: 1000 },
  WORDS_5000: { id: 'words_5000', name: '词汇王者', description: '收藏5000个单词', icon: '🎖️', category: 'vocabulary', threshold: 5000 },
  
  // 连续学习里程碑
  STREAK_3: { id: 'streak_3', name: '三日坚持', description: '连续学习3天', icon: '🔥', category: 'streak', threshold: 3 },
  STREAK_7: { id: 'streak_7', name: '一周达人', description: '连续学习7天', icon: '⭐', category: 'streak', threshold: 7 },
  STREAK_14: { id: 'streak_14', name: '两周勇士', description: '连续学习14天', icon: '🌟', category: 'streak', threshold: 14 },
  STREAK_30: { id: 'streak_30', name: '月度冠军', description: '连续学习30天', icon: '🏅', category: 'streak', threshold: 30 },
  STREAK_100: { id: 'streak_100', name: '百日传奇', description: '连续学习100天', icon: '💎', category: 'streak', threshold: 100 },
  STREAK_365: { id: 'streak_365', name: '年度之星', description: '连续学习365天', icon: '🌈', category: 'streak', threshold: 365 },
  
  // 掌握度成就
  MASTERED_10: { id: 'mastered_10', name: '初露锋芒', description: '掌握10个单词', icon: '✨', category: 'mastery', threshold: 10 },
  MASTERED_50: { id: 'mastered_50', name: '学有所成', description: '掌握50个单词', icon: '🎯', category: 'mastery', threshold: 50 },
  MASTERED_100: { id: 'mastered_100', name: '融会贯通', description: '掌握100个单词', icon: '🎓', category: 'mastery', threshold: 100 },
  
  // 复习成就
  REVIEW_100: { id: 'review_100', name: '复习达人', description: '完成100次复习', icon: '🔄', category: 'review', threshold: 100 },
  REVIEW_500: { id: 'review_500', name: '复习专家', description: '完成500次复习', icon: '📝', category: 'review', threshold: 500 },
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  unlockedAt?: string;
  progress?: number;
}

export interface UserAchievementStatus {
  unlocked: Achievement[];
  locked: Achievement[];
  recentUnlocks: Achievement[];
}

// 获取用户成就状态
export async function getUserAchievements(userId: string): Promise<UserAchievementStatus> {
  // 先检查并解锁符合条件的成就
  await checkAndUnlockAchievements(userId);
  
  const [userAchievements, stats] = await Promise.all([
    prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    }),
    getAchievementProgress(userId),
  ]);

  const unlockedIds = new Set(userAchievements.map((a: UserAchievementRecord) => a.achievementId));
  const unlocked: Achievement[] = [];
  const locked: Achievement[] = [];

  for (const [_key, achievement] of Object.entries(ACHIEVEMENTS)) {
    const userAchievement = userAchievements.find((a: UserAchievementRecord) => a.achievementId === achievement.id);
    const progress = getProgressForAchievement(achievement, stats);
    
    if (unlockedIds.has(achievement.id)) {
      unlocked.push({
        ...achievement,
        unlockedAt: userAchievement?.unlockedAt.toISOString(),
        progress: 100,
      });
    } else {
      locked.push({
        ...achievement,
        progress,
      });
    }
  }

  // 最近7天解锁的成就
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUnlocks = unlocked.filter(a => 
    a.unlockedAt && new Date(a.unlockedAt) >= sevenDaysAgo
  );

  return { unlocked, locked, recentUnlocks };
}

// 获取成就进度数据
async function getAchievementProgress(userId: string) {
  const [totalWords, streak, masteredCount, reviewCount] = await Promise.all([
    prisma.favoriteWord.count({ where: { userId } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.favoriteWord.count({ where: { userId, masteryLevel: 'mastered' } }),
    prisma.learningActivity.count({ where: { userId, activityType: 'review' } }),
  ]);

  return {
    totalWords,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    masteredCount,
    reviewCount,
  };
}

// 计算单个成就的进度
function getProgressForAchievement(
  achievement: typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS],
  stats: Awaited<ReturnType<typeof getAchievementProgress>>
): number {
  let current = 0;
  
  switch (achievement.category) {
    case 'vocabulary':
      current = stats.totalWords;
      break;
    case 'streak':
      current = Math.max(stats.currentStreak, stats.longestStreak);
      break;
    case 'mastery':
      current = stats.masteredCount;
      break;
    case 'review':
      current = stats.reviewCount;
      break;
  }

  return Math.min(100, Math.round((current / achievement.threshold) * 100));
}

// 检查并解锁成就
export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
  const stats = await getAchievementProgress(userId);
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existingAchievements.map((a: { achievementId: string }) => a.achievementId));
  
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of Object.values(ACHIEVEMENTS)) {
    if (existingIds.has(achievement.id)) continue;

    let shouldUnlock = false;
    
    switch (achievement.category) {
      case 'vocabulary':
        shouldUnlock = stats.totalWords >= achievement.threshold;
        break;
      case 'streak':
        shouldUnlock = Math.max(stats.currentStreak, stats.longestStreak) >= achievement.threshold;
        break;
      case 'mastery':
        shouldUnlock = stats.masteredCount >= achievement.threshold;
        break;
      case 'review':
        shouldUnlock = stats.reviewCount >= achievement.threshold;
        break;
    }

    if (shouldUnlock) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });
      newlyUnlocked.push({ ...achievement, unlockedAt: new Date().toISOString(), progress: 100 });
    }
  }

  return newlyUnlocked;
}

// 获取等级徽章
export function getUserLevel(totalWords: number): { level: number; name: string; icon: string; nextLevel: number; progress: number } {
  const levels = [
    { threshold: 0, name: '初学者', icon: '🌱' },
    { threshold: 50, name: '学徒', icon: '📚' },
    { threshold: 100, name: '见习生', icon: '📖' },
    { threshold: 250, name: '学者', icon: '🎓' },
    { threshold: 500, name: '专家', icon: '⭐' },
    { threshold: 1000, name: '大师', icon: '🏆' },
    { threshold: 2500, name: '宗师', icon: '👑' },
    { threshold: 5000, name: '传奇', icon: '💎' },
    { threshold: 10000, name: '神话', icon: '🌟' },
  ];

  let currentLevel = levels[0];
  let nextLevelThreshold = levels[1]?.threshold || Infinity;

  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalWords >= levels[i].threshold) {
      currentLevel = levels[i];
      nextLevelThreshold = levels[i + 1]?.threshold || Infinity;
      break;
    }
  }

  const levelIndex = levels.indexOf(currentLevel);
  const prevThreshold = currentLevel.threshold;
  const progress = nextLevelThreshold === Infinity 
    ? 100 
    : Math.round(((totalWords - prevThreshold) / (nextLevelThreshold - prevThreshold)) * 100);

  return {
    level: levelIndex + 1,
    name: currentLevel.name,
    icon: currentLevel.icon,
    nextLevel: nextLevelThreshold,
    progress,
  };
}
