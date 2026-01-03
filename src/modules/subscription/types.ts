/**
 * Subscription Module Type Definitions
 * Contains subscription status, plan features, and usage-related interfaces
 * 
 * Requirements: 12.2
 */

// ==================== Plan Types ====================

/**
 * Subscription plan names
 */
export type PlanName = 'free' | 'premium';

/**
 * Subscription status values
 */
export type SubscriptionStatusValue = 'active' | 'expired' | 'cancelled';

/**
 * Usage types that can be tracked
 */
export type UsageType = 'translation' | 'review' | 'collection' | 'website_rule';

// ==================== Translation Limit Types ====================

/**
 * Result of a translation limit check
 * Requirements: 3.1, 3.2, 3.4, 3.5
 */
export interface TranslationLimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  isPremium: boolean;
  message?: string;
}

// ==================== Plan Features ====================

/**
 * Translation feature configuration
 */
export interface TranslationFeatures {
  dailyLimit: number;        // 每日段落限制，0=无限
  maxRatio: number;          // 最大翻译比例 (1-100)
  languages: string[];       // 可用语言代码
  levels: string[];          // 可用等级
  styles: string[];          // 可用样式
  positionControl: boolean;  // 翻译位置控制
  bracketControl: boolean;   // 括号显示控制
  lengthControl: boolean;    // 段落长度控制
}

/**
 * Pronunciation feature configuration
 */
export interface PronunciationFeatures {
  webSpeechTTS: boolean;     // 浏览器原生TTS
  youdaoTTS: boolean;        // 有道高品质TTS
  accentSwitch: boolean;     // 英美发音切换
  aiDefinition: boolean;     // AI词义解释
  nestedTooltip: boolean;    // 双层悬浮框
  hotkey: boolean;           // 发音快捷键
}

/**
 * Vocabulary feature configuration
 */
export interface VocabularyFeatures {
  maxWords: number;          // 最大收藏数，0=无限
  lists: boolean;            // 词汇列表功能
  tags: boolean;             // 高级标签系统
  masteryLevel: boolean;     // 掌握度管理
  cloudSync: boolean;        // 云端同步
}

/**
 * Review feature configuration
 */
export interface ReviewFeatures {
  dailyLimit: number;        // 每日复习限制
  smartRecommend: boolean;   // 智能复习推荐
  reviewPlan: boolean;       // 复习计划
}

/**
 * Website management feature configuration
 */
export interface WebsiteFeatures {
  maxRules: number;          // 最大规则数，0=无限
  whitelist: boolean;        // 白名单功能
}

/**
 * General features configuration
 */
export interface GeneralFeatures {
  floatingBall: boolean;     // 悬浮工具球
  hotkeys: boolean;          // 快捷键管理
  contextMenu: boolean;      // 右键菜单
  multiApi: boolean;         // 多API配置
  customCSS: boolean;        // 自定义CSS
}

/**
 * Gamification feature configuration
 */
export interface GamificationFeatures {
  achievements: boolean;     // 成就系统
  goals: boolean;            // 目标系统
  reminders: boolean;        // 学习提醒
}

/**
 * Statistics feature configuration
 */
export interface StatisticsFeatures {
  basic: boolean;            // 基础统计
  advanced: boolean;         // 高级统计
  trends: boolean;           // 趋势分析
}

/**
 * Export feature configuration
 */
export interface ExportFeatures {
  json: boolean;             // JSON导出
  csv: boolean;              // CSV导出
  anki: boolean;             // Anki导出
  custom: boolean;           // 自定义导出
}

/**
 * Complete plan features configuration
 * Matches backend PlanFeatures interface
 */
export interface PlanFeatures {
  translation: TranslationFeatures;
  pronunciation: PronunciationFeatures;
  vocabulary: VocabularyFeatures;
  review: ReviewFeatures;
  website: WebsiteFeatures;
  features: GeneralFeatures;
  gamification: GamificationFeatures;
  statistics: StatisticsFeatures;
  export: ExportFeatures;
}

// ==================== Subscription Status ====================

/**
 * Plan information in subscription response
 */
export interface PlanInfo {
  id: string;
  name: PlanName;
  displayName: string;
}

/**
 * Subscription response from API
 */
export interface SubscriptionResponse {
  id: string;
  plan: PlanInfo;
  status: SubscriptionStatusValue;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  isPremium: boolean;
}

/**
 * Full subscription status including features
 * Response from GET /api/subscription/status
 */
export interface SubscriptionStatus {
  subscription: SubscriptionResponse;
  features: PlanFeatures;
}

// ==================== Usage Status ====================

/**
 * Result of checking usage limits
 */
export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

/**
 * Complete usage status for all tracked types
 * Response from GET /api/subscription/usage
 */
export interface UsageStatus {
  translation: UsageLimitResult;
  review: UsageLimitResult;
  collection: UsageLimitResult;
  website_rule: UsageLimitResult;
}

// ==================== API Response Types ====================

/**
 * Generic API response wrapper
 */
export interface SubscriptionApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ==================== Event Types ====================

/**
 * Subscription event types
 */
export enum SubscriptionEventType {
  STATUS_UPDATED = 'subscription:status_updated',
  FEATURES_UPDATED = 'subscription:features_updated',
  USAGE_UPDATED = 'subscription:usage_updated',
  LIMIT_REACHED = 'subscription:limit_reached',
  CACHE_INVALIDATED = 'subscription:cache_invalidated',
}

/**
 * Subscription event data
 */
export interface SubscriptionEventData {
  type: SubscriptionEventType;
  timestamp: number;
  status?: SubscriptionStatus;
  usage?: UsageStatus;
  limitType?: UsageType;
  error?: string;
}

/**
 * Subscription event listener
 */
export type SubscriptionEventListener = (event: SubscriptionEventData) => void;

// ==================== Cache Types ====================

/**
 * Cached subscription data structure
 */
export interface SubscriptionCache {
  status: SubscriptionStatus | null;
  usage: UsageStatus | null;
  statusCachedAt: number | null;
  usageCachedAt: number | null;
}

/**
 * Default cache values
 */
export const DEFAULT_SUBSCRIPTION_CACHE: SubscriptionCache = {
  status: null,
  usage: null,
  statusCachedAt: null,
  usageCachedAt: null,
};

// ==================== Constants ====================

/**
 * Cache TTL values in milliseconds
 */
export const CACHE_TTL = {
  STATUS: 5 * 60 * 1000,    // 5 minutes for subscription status
  USAGE: 1 * 60 * 1000,     // 1 minute for usage (changes more frequently)
  FEATURES: 10 * 60 * 1000, // 10 minutes for features
} as const;

/**
 * Storage key for subscription cache
 */
export const SUBSCRIPTION_STORAGE_KEY = 'subscription_cache';

// ==================== Feature Gate Types ====================

/**
 * Feature names that can be gated
 * Requirements: 10.1-10.7
 */
export type FeatureName =
  | 'aiDefinition'
  | 'youdaoTTS'
  | 'vocabularyLists'
  | 'achievements'
  | 'goals'
  | 'advancedStats'
  | 'csvExport'
  | 'ankiExport'
  | 'whitelist'
  | 'customCSS'
  | 'floatingBall'
  | 'hotkeys'
  | 'contextMenu'
  | 'multiApi'
  | 'smartRecommend'
  | 'reviewPlan'
  | 'tags'
  | 'masteryLevel'
  | 'cloudSync'
  | 'accentSwitch'
  | 'nestedTooltip'
  | 'pronunciationHotkey'
  | 'positionControl'
  | 'bracketControl'
  | 'lengthControl'
  | 'trends'
  | 'reminders';

/**
 * Option types for filtering available options
 * Requirements: 5.1, 7.1, 8.1
 */
export type OptionType = 'language' | 'style' | 'level' | 'ratio';

// ==================== Upgrade Prompt Types ====================

/**
 * Reasons for showing upgrade prompts
 * Requirements: 11.1, 11.2
 */
export type UpgradeReason =
  | 'translation_limit'
  | 'collection_limit'
  | 'review_limit'
  | 'ratio_limit'
  | 'language_locked'
  | 'style_locked'
  | 'level_locked'
  | 'feature_locked'
  | 'rule_limit';

/**
 * Context data for upgrade prompts
 */
export interface UpgradePromptContext {
  current?: number;
  limit?: number;
  feature?: string;
  lockedValue?: string;
  message?: string;
}

/**
 * Upgrade prompt data structure
 */
export interface UpgradePromptData {
  reason: UpgradeReason;
  context?: UpgradePromptContext;
  timestamp: number;
}

/**
 * Storage structure for prompt history
 * Used to enforce 24-hour limit per prompt type
 */
export interface PromptHistory {
  [key: string]: number; // reason -> last shown timestamp
}

/**
 * Upgrade prompt storage key
 */
export const UPGRADE_PROMPT_STORAGE_KEY = 'upgrade_prompt_history';

/**
 * Prompt cooldown period (24 hours in milliseconds)
 * Requirements: 11.4
 */
export const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Result of feature access check
 */
export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}

/**
 * Result of option value check
 */
export interface OptionValueResult {
  allowed: boolean;
  maxValue?: number;
  availableOptions?: string[];
}
