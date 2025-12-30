import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Pronunciation, Meaning, ExampleSentence, MasteryLevel } from '../types/index.js';

export interface FavoriteWordInput {
  word: string;
  originalText?: string;
  pronunciation?: Pronunciation;
  meanings?: Meaning[];
  exampleSentences?: ExampleSentence[];
  sourceUrl?: string;
  context?: string;
  tags?: string[];
}

export interface FavoriteWordResponse {
  id: string;
  word: string;
  originalText: string | null;
  pronunciation: Pronunciation | null;
  meanings: Meaning[] | null;
  exampleSentences: ExampleSentence[] | null;
  sourceUrl: string | null;
  context: string | null;
  tags: string[];
  masteryLevel: MasteryLevel;
  reviewCount: number;
  lastReviewedAt: Date | null;
  favoritedAt: Date;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tags?: string[];
  masteryLevel?: MasteryLevel;
  domain?: string;
  sortBy?: 'favoritedAt' | 'word' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface SyncInput {
  words: FavoriteWordInput[];
  lastSyncAt?: string;
}

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapToResponse(word: {
  id: string;
  word: string;
  originalText: string | null;
  pronunciation: unknown;
  meanings: unknown;
  exampleSentences: unknown;
  sourceUrl: string | null;
  context: string | null;
  tags: unknown;
  masteryLevel: string;
  reviewCount: number;
  lastReviewedAt: Date | null;
  favoritedAt: Date;
}): FavoriteWordResponse {
  return {
    id: word.id,
    word: word.word,
    originalText: word.originalText,
    pronunciation: word.pronunciation as Pronunciation | null,
    meanings: word.meanings as Meaning[] | null,
    exampleSentences: word.exampleSentences as ExampleSentence[] | null,
    sourceUrl: word.sourceUrl,
    context: word.context,
    tags: parseTags(word.tags),
    masteryLevel: word.masteryLevel as MasteryLevel,
    reviewCount: word.reviewCount,
    lastReviewedAt: word.lastReviewedAt,
    favoritedAt: word.favoritedAt,
  };
}

export async function getWordById(
  userId: string,
  wordId: string
): Promise<FavoriteWordResponse> {
  const word = await prisma.favoriteWord.findFirst({
    where: { id: wordId, userId },
  });

  if (!word) {
    throw new AppError('VOCAB_NOT_FOUND', 'Word not found in collection', 404);
  }

  return mapToResponse(word);
}

export async function getVocabulary(
  userId: string,
  params: ListParams
): Promise<{ words: FavoriteWordResponse[]; total: number }> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const skip = (page - 1) * pageSize;

  // Build where clause for MySQL
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId };

  if (params.search) {
    where.word = { contains: params.search };
  }

  // Note: MySQL JSON array filtering is limited, tags filtering done post-query if needed
  // For now, we skip tags filtering at DB level for MySQL compatibility

  if (params.masteryLevel) {
    where.masteryLevel = params.masteryLevel;
  }

  // Domain filter - filter by sourceUrl containing the domain
  if (params.domain) {
    where.sourceUrl = { contains: params.domain };
  }

  // Build order by
  const orderBy: Record<string, 'asc' | 'desc'> = {};
  const sortBy = params.sortBy || 'favoritedAt';
  const sortOrder = params.sortOrder || 'desc';
  orderBy[sortBy] = sortOrder;

  const [words, total] = await Promise.all([
    prisma.favoriteWord.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.favoriteWord.count({ where }),
  ]);

  // Post-filter by tags if needed (MySQL doesn't support array hasSome)
  let filteredWords = words;
  if (params.tags && params.tags.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredWords = words.filter((word: any) => {
      const wordTags = parseTags(word.tags);
      return params.tags!.some((tag) => wordTags.includes(tag));
    });
  }

  return {
    words: filteredWords.map(mapToResponse),
    total: params.tags && params.tags.length > 0 ? filteredWords.length : total,
  };
}

export async function addWord(
  userId: string,
  input: FavoriteWordInput
): Promise<FavoriteWordResponse> {
  // Check if word already exists for this user
  const existing = await prisma.favoriteWord.findUnique({
    where: {
      userId_word: {
        userId,
        word: input.word,
      },
    },
  });

  if (existing) {
    throw new AppError('VOCAB_DUPLICATE', 'Word already in collection', 400);
  }

  const word = await prisma.favoriteWord.create({
    data: {
      userId,
      word: input.word,
      originalText: input.originalText,
      pronunciation: input.pronunciation ? (input.pronunciation as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      meanings: input.meanings ? (input.meanings as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      exampleSentences: input.exampleSentences ? (input.exampleSentences as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      sourceUrl: input.sourceUrl,
      context: input.context,
      tags: input.tags || [],
    },
  });

  // Record learning activity
  await prisma.learningActivity.create({
    data: {
      userId,
      activityType: 'favorite',
      wordId: word.id,
      metadata: { word: input.word },
    },
  });

  // Update streak
  await updateStreak(userId);

  return mapToResponse(word);
}

export async function deleteWord(userId: string, wordId: string): Promise<void> {
  const word = await prisma.favoriteWord.findFirst({
    where: { id: wordId, userId },
  });

  if (!word) {
    throw new AppError('VOCAB_NOT_FOUND', 'Word not found in collection', 404);
  }

  await prisma.favoriteWord.delete({
    where: { id: wordId },
  });

  // Record learning activity
  await prisma.learningActivity.create({
    data: {
      userId,
      activityType: 'unfavorite',
      metadata: { word: word.word },
    },
  });
}

export async function updateTags(
  userId: string,
  wordId: string,
  tags: string[]
): Promise<FavoriteWordResponse> {
  const word = await prisma.favoriteWord.findFirst({
    where: { id: wordId, userId },
  });

  if (!word) {
    throw new AppError('VOCAB_NOT_FOUND', 'Word not found in collection', 404);
  }

  const updated = await prisma.favoriteWord.update({
    where: { id: wordId },
    data: { tags },
  });

  return mapToResponse(updated);
}

export async function syncWords(
  userId: string,
  input: SyncInput
): Promise<{ synced: number; created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const wordInput of input.words) {
    const existing = await prisma.favoriteWord.findUnique({
      where: {
        userId_word: {
          userId,
          word: wordInput.word,
        },
      },
    });

    if (existing) {
      // Update existing word
      await prisma.favoriteWord.update({
        where: { id: existing.id },
        data: {
          originalText: wordInput.originalText,
          pronunciation: wordInput.pronunciation ? (wordInput.pronunciation as unknown as Prisma.InputJsonValue) : undefined,
          meanings: wordInput.meanings ? (wordInput.meanings as unknown as Prisma.InputJsonValue) : undefined,
          exampleSentences: wordInput.exampleSentences ? (wordInput.exampleSentences as unknown as Prisma.InputJsonValue) : undefined,
          sourceUrl: wordInput.sourceUrl,
          context: wordInput.context,
          tags: wordInput.tags || parseTags(existing.tags),
        },
      });
      updated++;
    } else {
      // Create new word
      await prisma.favoriteWord.create({
        data: {
          userId,
          word: wordInput.word,
          originalText: wordInput.originalText,
          pronunciation: wordInput.pronunciation ? (wordInput.pronunciation as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          meanings: wordInput.meanings ? (wordInput.meanings as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          exampleSentences: wordInput.exampleSentences ? (wordInput.exampleSentences as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          sourceUrl: wordInput.sourceUrl,
          context: wordInput.context,
          tags: wordInput.tags || [],
        },
      });
      created++;
    }
  }

  // Update streak
  await updateStreak(userId);

  return {
    synced: input.words.length,
    created,
    updated,
  };
}

async function updateStreak(userId: string): Promise<void> {
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
