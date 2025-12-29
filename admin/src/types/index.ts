export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Pronunciation {
  phonetic: string;
  audioUrl?: string;
  ukPhonetic?: string;
  usPhonetic?: string;
}

export interface Meaning {
  partOfSpeech: string;
  definition: string;
  examples?: string[];
}

export interface ExampleSentence {
  sentence: string;
  translation: string;
  source?: string;
}

export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

export interface FavoriteWord {
  id: string;
  userId: string;
  word: string;
  originalText?: string;
  pronunciation?: Pronunciation;
  meanings: Meaning[];
  exampleSentences: ExampleSentence[];
  sourceUrl?: string;
  context?: string;
  tags: string[];
  masteryLevel: MasteryLevel;
  reviewCount: number;
  lastReviewedAt?: string;
  favoritedAt: string;
}

export interface ReviewWord {
  id: string;
  word: string;
  originalText?: string;
  pronunciation?: Pronunciation;
  meanings: Meaning[];
  exampleSentences: ExampleSentence[];
  masteryLevel: MasteryLevel;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt: string;
  dueScore: number;
}

export interface ReviewResult {
  wordId: string;
  known: boolean;
  previousMasteryLevel: MasteryLevel;
  newMasteryLevel: MasteryLevel;
  nextReviewAt: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface UserOverview {
  totalWords: number;
  wordsThisWeek: number;
  currentStreak: number;
  longestStreak: number;
  masteryDistribution: {
    new: number;
    learning: number;
    familiar: number;
    mastered: number;
  };
}

export interface DailyActivity {
  date: string;
  wordsAdded: number;
  wordsReviewed: number;
}

export interface SourceStats {
  domain: string;
  count: number;
}

export interface LearningStats {
  dailyActivity: DailyActivity[];
  wordsBySource: SourceStats[];
  totalWords: number;
  averageWordsPerDay: number;
}

export interface VocabularyList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyListWithWords extends VocabularyList {
  words: {
    id: string;
    word: string;
    addedAt: string;
  }[];
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  subscriptionTier: string;
  role: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  lastLoginAt: string | null;
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
