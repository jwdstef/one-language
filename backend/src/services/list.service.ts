/**
 * Vocabulary List Service
 * Manages custom vocabulary lists
 * Requirements: 9.4
 */

import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export interface VocabularyListInput {
  name: string;
  description?: string;
  color?: string;
}

export interface VocabularyListResponse {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocabularyListWithWords extends VocabularyListResponse {
  words: {
    id: string;
    word: string;
    addedAt: Date;
  }[];
}

/**
 * Get all vocabulary lists for a user
 */
export async function getLists(userId: string): Promise<VocabularyListResponse[]> {
  const lists = await prisma.vocabularyList.findMany({
    where: { userId },
    include: {
      _count: {
        select: { words: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return lists.map((list: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { words: number };
  }) => ({
    id: list.id,
    name: list.name,
    description: list.description,
    color: list.color,
    wordCount: list._count.words,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }));
}

/**
 * Get a single vocabulary list with its words
 */
export async function getListById(
  userId: string,
  listId: string
): Promise<VocabularyListWithWords> {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
    include: {
      words: {
        include: {
          word: {
            select: {
              id: true,
              word: true,
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
      _count: {
        select: { words: true },
      },
    },
  });

  if (!list) {
    throw new AppError('LIST_NOT_FOUND', 'Vocabulary list not found', 404);
  }

  return {
    id: list.id,
    name: list.name,
    description: list.description,
    color: list.color,
    wordCount: list._count.words,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    words: list.words.map((w: { word: { id: string; word: string }; addedAt: Date }) => ({
      id: w.word.id,
      word: w.word.word,
      addedAt: w.addedAt,
    })),
  };
}


/**
 * Create a new vocabulary list
 */
export async function createList(
  userId: string,
  input: VocabularyListInput
): Promise<VocabularyListResponse> {
  // Check if list with same name already exists
  const existing = await prisma.vocabularyList.findUnique({
    where: {
      userId_name: {
        userId,
        name: input.name,
      },
    },
  });

  if (existing) {
    throw new AppError('LIST_DUPLICATE', 'A list with this name already exists', 400);
  }

  const list = await prisma.vocabularyList.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      color: input.color || '#3b82f6',
    },
  });

  return {
    id: list.id,
    name: list.name,
    description: list.description,
    color: list.color,
    wordCount: 0,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
}

/**
 * Update a vocabulary list
 */
export async function updateList(
  userId: string,
  listId: string,
  input: Partial<VocabularyListInput>
): Promise<VocabularyListResponse> {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new AppError('LIST_NOT_FOUND', 'Vocabulary list not found', 404);
  }

  // Check for name conflict if name is being changed
  if (input.name && input.name !== list.name) {
    const existing = await prisma.vocabularyList.findUnique({
      where: {
        userId_name: {
          userId,
          name: input.name,
        },
      },
    });

    if (existing) {
      throw new AppError('LIST_DUPLICATE', 'A list with this name already exists', 400);
    }
  }

  const updated = await prisma.vocabularyList.update({
    where: { id: listId },
    data: {
      name: input.name,
      description: input.description,
      color: input.color,
    },
    include: {
      _count: {
        select: { words: true },
      },
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    color: updated.color,
    wordCount: updated._count.words,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Delete a vocabulary list
 */
export async function deleteList(userId: string, listId: string): Promise<void> {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new AppError('LIST_NOT_FOUND', 'Vocabulary list not found', 404);
  }

  await prisma.vocabularyList.delete({
    where: { id: listId },
  });
}

/**
 * Add a word to a vocabulary list
 */
export async function addWordToList(
  userId: string,
  listId: string,
  wordId: string
): Promise<void> {
  // Verify list belongs to user
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new AppError('LIST_NOT_FOUND', 'Vocabulary list not found', 404);
  }

  // Verify word belongs to user
  const word = await prisma.favoriteWord.findFirst({
    where: { id: wordId, userId },
  });

  if (!word) {
    throw new AppError('VOCAB_NOT_FOUND', 'Word not found in your vocabulary', 404);
  }

  // Check if word is already in list
  const existing = await prisma.vocabularyListWord.findUnique({
    where: {
      listId_wordId: {
        listId,
        wordId,
      },
    },
  });

  if (existing) {
    // Word already in list, no action needed
    return;
  }

  await prisma.vocabularyListWord.create({
    data: {
      listId,
      wordId,
    },
  });
}

/**
 * Remove a word from a vocabulary list
 */
export async function removeWordFromList(
  userId: string,
  listId: string,
  wordId: string
): Promise<void> {
  // Verify list belongs to user
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new AppError('LIST_NOT_FOUND', 'Vocabulary list not found', 404);
  }

  await prisma.vocabularyListWord.deleteMany({
    where: {
      listId,
      wordId,
    },
  });
}

/**
 * Get lists that contain a specific word
 */
export async function getListsForWord(
  userId: string,
  wordId: string
): Promise<VocabularyListResponse[]> {
  const lists = await prisma.vocabularyList.findMany({
    where: {
      userId,
      words: {
        some: {
          wordId,
        },
      },
    },
    include: {
      _count: {
        select: { words: true },
      },
    },
  });

  return lists.map((list: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { words: number };
  }) => ({
    id: list.id,
    name: list.name,
    description: list.description,
    color: list.color,
    wordCount: list._count.words,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  }));
}
