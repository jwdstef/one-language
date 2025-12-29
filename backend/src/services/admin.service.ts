import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { UserStatus } from '../types/index.js';

// Type for user with word count
interface UserWithWordCount {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  subscriptionTier: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  _count: {
    favoriteWords: number;
  };
}

// Type for popular words groupBy result
interface PopularWordResult {
  word: string;
  _count: {
    word: number;
  };
}

// Type for mastery level groupBy result
interface MasteryLevelResult {
  masteryLevel: string;
  _count: {
    masteryLevel: number;
  };
}

// Type for raw query results
interface UserGrowthRow {
  date: Date;
  count: bigint;
}

interface TopSourceRow {
  domain: string | null;
  count: bigint;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  subscriptionTier: string;
  role: string;
  status: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  wordCount: number;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalWordsSaved: number;
  averageWordsPerUser: number;
  userGrowth: { date: string; count: number }[];
}

export interface VocabularyStats {
  totalWords: number;
  wordsAddedToday: number;
  wordsAddedThisWeek: number;
  wordsAddedThisMonth: number;
  popularWords: { word: string; count: number }[];
  wordsByMastery: { level: string; count: number }[];
  topSources: { domain: string; count: number }[];
}

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UserStatus;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}


export async function getUsers(
  params: ListUsersParams
): Promise<{ users: AdminUser[]; total: number }> {
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  // Get users with word count
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { favoriteWords: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((user: UserWithWordCount) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      wordCount: user._count.favoriteWords,
    })),
    total,
  };
}

export async function getUserById(userId: string): Promise<AdminUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { favoriteWords: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    subscriptionTier: user.subscriptionTier,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    wordCount: user._count.favoriteWords,
  };
}


export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<AdminUser> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  }

  // Prevent disabling admin users
  if (existingUser.role === 'admin' && status !== 'active') {
    throw new AppError('CANNOT_DISABLE_ADMIN', 'Cannot disable admin accounts', 400);
  }

  // Update user status
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
    include: {
      _count: {
        select: { favoriteWords: true },
      },
    },
  });

  // If user is suspended/deleted, invalidate all their refresh tokens
  if (status !== 'active') {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    subscriptionTier: user.subscriptionTier,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    wordCount: user._count.favoriteWords,
  };
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    totalWordsSaved,
    userGrowthData,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Active users (logged in within last 30 days)
    prisma.user.count({
      where: {
        status: 'active',
        lastLoginAt: { gte: monthAgo },
      },
    }),

    // Suspended users
    prisma.user.count({
      where: { status: 'suspended' },
    }),

    // New users today
    prisma.user.count({
      where: { createdAt: { gte: todayStart } },
    }),

    // New users this week
    prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    }),

    // New users this month
    prisma.user.count({
      where: { createdAt: { gte: monthAgo } },
    }),

    // Total words saved
    prisma.favoriteWord.count(),

    // User growth over last 30 days
    prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= ${monthAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
  ]);

  // Calculate average words per user
  const averageWordsPerUser = totalUsers > 0 ? Math.round(totalWordsSaved / totalUsers) : 0;

  // Format user growth data
  const userGrowth = userGrowthData.map((row: UserGrowthRow) => ({
    date: row.date.toISOString().split('T')[0],
    count: Number(row.count),
  }));

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    totalWordsSaved,
    averageWordsPerUser,
    userGrowth,
  };
}


export async function getVocabularyStats(): Promise<VocabularyStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalWords,
    wordsAddedToday,
    wordsAddedThisWeek,
    wordsAddedThisMonth,
    popularWordsData,
    wordsByMasteryData,
    topSourcesData,
  ] = await Promise.all([
    // Total words
    prisma.favoriteWord.count(),

    // Words added today
    prisma.favoriteWord.count({
      where: { favoritedAt: { gte: todayStart } },
    }),

    // Words added this week
    prisma.favoriteWord.count({
      where: { favoritedAt: { gte: weekAgo } },
    }),

    // Words added this month
    prisma.favoriteWord.count({
      where: { favoritedAt: { gte: monthAgo } },
    }),

    // Most popular words (favorited by most users)
    prisma.favoriteWord.groupBy({
      by: ['word'],
      _count: { word: true },
      orderBy: { _count: { word: 'desc' } },
      take: 20,
    }),

    // Words by mastery level
    prisma.favoriteWord.groupBy({
      by: ['masteryLevel'],
      _count: { masteryLevel: true },
    }),

    // Top source domains
    prisma.$queryRaw<{ domain: string; count: bigint }[]>`
      SELECT 
        CASE 
          WHEN source_url IS NULL OR source_url = '' THEN 'unknown'
          ELSE SUBSTRING(source_url FROM '://([^/]+)')
        END as domain,
        COUNT(*) as count
      FROM favorite_words
      WHERE source_url IS NOT NULL AND source_url != ''
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  return {
    totalWords,
    wordsAddedToday,
    wordsAddedThisWeek,
    wordsAddedThisMonth,
    popularWords: popularWordsData.map((item: PopularWordResult) => ({
      word: item.word,
      count: item._count.word,
    })),
    wordsByMastery: wordsByMasteryData.map((item: MasteryLevelResult) => ({
      level: item.masteryLevel,
      count: item._count.masteryLevel,
    })),
    topSources: topSourcesData.map((item: TopSourceRow) => ({
      domain: item.domain || 'unknown',
      count: Number(item.count),
    })),
  };
}

// Admin vocabulary listing params
export interface ListVocabularyParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
  masteryLevel?: string;
  userId?: string;
  sortBy?: 'favoritedAt' | 'word' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

// Get all vocabulary for admin (across all users)
export async function getAllVocabulary(params: ListVocabularyParams) {
  const {
    page = 1,
    pageSize = 20,
    search,
    tag,
    masteryLevel,
    userId,
    sortBy = 'favoritedAt',
    sortOrder = 'desc',
  } = params;

  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { word: { contains: search, mode: 'insensitive' } },
      { originalText: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tag) {
    where.tags = { has: tag };
  }

  if (masteryLevel) {
    where.masteryLevel = masteryLevel;
  }

  if (userId) {
    where.userId = userId;
  }

  const [words, total] = await Promise.all([
    prisma.favoriteWord.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.favoriteWord.count({ where }),
  ]);

  return { words, total };
}

// Get a single word by ID for admin
export async function getWordById(wordId: string) {
  const word = await prisma.favoriteWord.findUnique({
    where: { id: wordId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!word) {
    throw new AppError('WORD_NOT_FOUND', 'Word not found', 404);
  }

  return word;
}

// Delete a word by ID for admin
export async function deleteWord(wordId: string) {
  const word = await prisma.favoriteWord.findUnique({
    where: { id: wordId },
  });

  if (!word) {
    throw new AppError('WORD_NOT_FOUND', 'Word not found', 404);
  }

  await prisma.favoriteWord.delete({
    where: { id: wordId },
  });

  return { success: true };
}

// Update word tags for admin
export async function updateWordTags(wordId: string, tags: string[]) {
  const word = await prisma.favoriteWord.findUnique({
    where: { id: wordId },
  });

  if (!word) {
    throw new AppError('WORD_NOT_FOUND', 'Word not found', 404);
  }

  const updatedWord = await prisma.favoriteWord.update({
    where: { id: wordId },
    data: { tags },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedWord;
}
