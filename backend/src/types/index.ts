export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type SubscriptionTier = 'free' | 'premium' | 'enterprise';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';

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
