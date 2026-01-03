# Design Document: Subscription System

## Overview

本设计文档描述会员订阅系统的技术架构，包括数据模型、API设计、功能门控机制和使用量追踪系统。系统采用分层架构，后端提供订阅管理和使用量追踪API，前端实现功能门控和升级提示。

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser Extension                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ FeatureGate     │  │ UsageTracker    │  │ UpgradePrompt   │ │
│  │ Service         │  │ Client          │  │ Component       │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│           └────────────────────┼────────────────────┘          │
│                                │                               │
│                    ┌───────────▼───────────┐                   │
│                    │ SubscriptionService   │                   │
│                    │ (Frontend)            │                   │
│                    └───────────┬───────────┘                   │
└────────────────────────────────┼───────────────────────────────┘
                                 │ HTTP/REST
┌────────────────────────────────┼───────────────────────────────┐
│                      Backend API                               │
├────────────────────────────────┼───────────────────────────────┤
│                    ┌───────────▼───────────┐                   │
│                    │ Subscription Routes   │                   │
│                    └───────────┬───────────┘                   │
│                                │                               │
│  ┌─────────────────┐  ┌───────▼─────────┐  ┌─────────────────┐│
│  │ PlanService     │  │ Subscription    │  │ UsageService    ││
│  │                 │  │ Service         │  │                 ││
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘│
│           │                    │                    │          │
│           └────────────────────┼────────────────────┘          │
│                                │                               │
│                    ┌───────────▼───────────┐                   │
│                    │ Prisma ORM            │                   │
│                    └───────────┬───────────┘                   │
└────────────────────────────────┼───────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ MySQL Database          │
                    │ - subscription_plans    │
                    │ - subscriptions         │
                    │ - usage_records         │
                    └─────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### 1. SubscriptionPlanService

负责订阅计划的管理和查询。

```typescript
interface SubscriptionPlanService {
  // 获取所有可用计划
  getAllPlans(): Promise<SubscriptionPlan[]>;
  
  // 根据ID获取计划
  getPlanById(planId: string): Promise<SubscriptionPlan | null>;
  
  // 根据名称获取计划
  getPlanByName(name: 'free' | 'premium'): Promise<SubscriptionPlan | null>;
  
  // 获取计划的功能配置
  getPlanFeatures(planId: string): Promise<PlanFeatures>;
}
```

#### 2. SubscriptionService

负责用户订阅状态的管理。

```typescript
interface SubscriptionService {
  // 获取用户当前订阅
  getUserSubscription(userId: string): Promise<UserSubscription>;
  
  // 创建订阅（升级）
  createSubscription(userId: string, planId: string, duration: number): Promise<Subscription>;
  
  // 取消订阅
  cancelSubscription(subscriptionId: string): Promise<void>;
  
  // 检查订阅是否有效
  isSubscriptionActive(userId: string): Promise<boolean>;
  
  // 获取用户可用功能
  getUserFeatures(userId: string): Promise<PlanFeatures>;
  
  // 处理过期订阅（定时任务）
  processExpiredSubscriptions(): Promise<void>;
}
```

#### 3. UsageService

负责使用量的记录和查询。

```typescript
interface UsageService {
  // 记录使用量
  recordUsage(userId: string, type: UsageType, count?: number): Promise<void>;
  
  // 获取今日使用量
  getTodayUsage(userId: string, type: UsageType): Promise<number>;
  
  // 获取总使用量（如词汇收藏）
  getTotalUsage(userId: string, type: UsageType): Promise<number>;
  
  // 检查是否超出限制
  checkLimit(userId: string, type: UsageType): Promise<UsageLimitResult>;
  
  // 重置每日使用量（定时任务）
  resetDailyUsage(): Promise<void>;
}

type UsageType = 'translation' | 'review' | 'collection' | 'website_rule';

interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}
```

### Frontend Components

#### 4. SubscriptionService (Frontend)

前端订阅状态管理服务。

```typescript
interface SubscriptionServiceFrontend {
  // 获取当前订阅状态（带缓存）
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
  
  // 刷新订阅状态
  refreshSubscriptionStatus(): Promise<SubscriptionStatus>;
  
  // 检查是否为高级用户
  isPremium(): Promise<boolean>;
  
  // 获取功能配置
  getFeatures(): Promise<PlanFeatures>;
  
  // 获取使用量
  getUsage(): Promise<UsageStatus>;
}

interface SubscriptionStatus {
  plan: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: Date | null;
  features: PlanFeatures;
}

interface UsageStatus {
  translation: UsageLimitResult;
  review: UsageLimitResult;
  collection: UsageLimitResult;
  websiteRules: UsageLimitResult;
}
```

#### 5. FeatureGateService

功能门控服务，控制功能访问权限。

```typescript
interface FeatureGateService {
  // 检查功能是否可用
  canAccess(feature: FeatureName): Promise<boolean>;
  
  // 检查使用量限制
  canUse(usageType: UsageType): Promise<UsageLimitResult>;
  
  // 获取可用选项（语言、样式等）
  getAvailableOptions(optionType: OptionType): Promise<string[]>;
  
  // 检查值是否在允许范围内
  isValueAllowed(optionType: OptionType, value: any): Promise<boolean>;
}

type FeatureName = 
  | 'aiDefinition'
  | 'youdaoTTS'
  | 'vocabularyLists'
  | 'achievements'
  | 'goals'
  | 'advancedStats'
  | 'csvExport'
  | 'ankiExport'
  | 'whitelist'
  | 'customCSS';

type OptionType = 'language' | 'style' | 'level' | 'ratio';
```

#### 6. UpgradePromptService

升级提示管理服务。

```typescript
interface UpgradePromptService {
  // 显示升级提示
  showPrompt(reason: UpgradeReason, context?: any): void;
  
  // 检查是否应该显示提示（24小时限制）
  shouldShowPrompt(reason: UpgradeReason): boolean;
  
  // 记录提示已显示
  recordPromptShown(reason: UpgradeReason): void;
  
  // 关闭提示
  dismissPrompt(): void;
}

type UpgradeReason = 
  | 'translation_limit'
  | 'collection_limit'
  | 'review_limit'
  | 'ratio_limit'
  | 'language_locked'
  | 'style_locked'
  | 'feature_locked'
  | 'rule_limit';
```

## Data Models

### Database Schema (Prisma)

```prisma
// 订阅计划表
model SubscriptionPlan {
  id          String   @id @default(uuid())
  name        String   @unique // free, premium
  displayName String   @map("display_name")
  description String?
  price       Decimal  @default(0) @db.Decimal(10, 2)
  duration    Int      @default(0) // 天数，0=终身
  features    Json     // 功能配置JSON
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  subscriptions Subscription[]

  @@map("subscription_plans")
}

// 用户订阅表
model Subscription {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  planId    String    @map("plan_id")
  status    String    @default("active") // active, expired, cancelled
  startDate DateTime  @default(now()) @map("start_date")
  endDate   DateTime? @map("end_date") // null=终身
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  user User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan SubscriptionPlan @relation(fields: [planId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([endDate])
  @@map("subscriptions")
}

// 使用量记录表
model UsageRecord {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      String   // translation, review, collection, website_rule
  count     Int      @default(0)
  date      DateTime @db.Date // 用于每日限制
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, type, date])
  @@index([userId])
  @@index([date])
  @@map("usage_records")
}
```

### PlanFeatures JSON Structure

```typescript
interface PlanFeatures {
  translation: {
    dailyLimit: number;        // 每日段落限制，0=无限
    maxRatio: number;          // 最大翻译比例 (1-100)
    languages: string[];       // 可用语言代码
    levels: string[];          // 可用等级
    styles: string[];          // 可用样式
    positionControl: boolean;  // 翻译位置控制
    bracketControl: boolean;   // 括号显示控制
    lengthControl: boolean;    // 段落长度控制
  };
  pronunciation: {
    webSpeechTTS: boolean;     // 浏览器原生TTS
    youdaoTTS: boolean;        // 有道高品质TTS
    accentSwitch: boolean;     // 英美发音切换
    aiDefinition: boolean;     // AI词义解释
    nestedTooltip: boolean;    // 双层悬浮框
    hotkey: boolean;           // 发音快捷键
  };
  vocabulary: {
    maxWords: number;          // 最大收藏数，0=无限
    lists: boolean;            // 词汇列表功能
    tags: boolean;             // 高级标签系统
    masteryLevel: boolean;     // 掌握度管理
    cloudSync: boolean;        // 云端同步
  };
  review: {
    dailyLimit: number;        // 每日复习限制
    smartRecommend: boolean;   // 智能复习推荐
    reviewPlan: boolean;       // 复习计划
  };
  website: {
    maxRules: number;          // 最大规则数，0=无限
    whitelist: boolean;        // 白名单功能
  };
  features: {
    floatingBall: boolean;     // 悬浮工具球
    hotkeys: boolean;          // 快捷键管理
    contextMenu: boolean;      // 右键菜单
    multiApi: boolean;         // 多API配置
    customCSS: boolean;        // 自定义CSS
  };
  gamification: {
    achievements: boolean;     // 成就系统
    goals: boolean;            // 目标系统
    reminders: boolean;        // 学习提醒
  };
  statistics: {
    basic: boolean;            // 基础统计
    advanced: boolean;         // 高级统计
    trends: boolean;           // 趋势分析
  };
  export: {
    json: boolean;             // JSON导出
    csv: boolean;              // CSV导出
    anki: boolean;             // Anki导出
    custom: boolean;           // 自定义导出
  };
}
```

### Default Plan Configurations

```typescript
// 免费版配置
const FREE_PLAN_FEATURES: PlanFeatures = {
  translation: {
    dailyLimit: 100,
    maxRatio: 30,
    languages: ['zh', 'en', 'ja', 'ko', 'es'],
    levels: ['a1', 'b1', 'b2'],
    styles: ['default', 'subtle', 'bold'],
    positionControl: false,
    bracketControl: false,
    lengthControl: false,
  },
  pronunciation: {
    webSpeechTTS: true,
    youdaoTTS: false,
    accentSwitch: false,
    aiDefinition: false,
    nestedTooltip: false,
    hotkey: false,
  },
  vocabulary: {
    maxWords: 100,
    lists: false,
    tags: false,
    masteryLevel: false,
    cloudSync: false,
  },
  review: {
    dailyLimit: 20,
    smartRecommend: false,
    reviewPlan: false,
  },
  website: {
    maxRules: 10,
    whitelist: false,
  },
  features: {
    floatingBall: false,
    hotkeys: false,
    contextMenu: false,
    multiApi: false,
    customCSS: false,
  },
  gamification: {
    achievements: false,
    goals: false,
    reminders: false,
  },
  statistics: {
    basic: true,
    advanced: false,
    trends: false,
  },
  export: {
    json: true,
    csv: false,
    anki: false,
    custom: false,
  },
};

// 高级版配置
const PREMIUM_PLAN_FEATURES: PlanFeatures = {
  translation: {
    dailyLimit: 0, // 无限
    maxRatio: 100,
    languages: ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'it', 'pt', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'tr', 'el', 'ar', 'th', 'vi'],
    levels: ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
    styles: ['default', 'subtle', 'bold', 'italic', 'underlined', 'highlighted', 'learning', 'custom'],
    positionControl: true,
    bracketControl: true,
    lengthControl: true,
  },
  pronunciation: {
    webSpeechTTS: true,
    youdaoTTS: true,
    accentSwitch: true,
    aiDefinition: true,
    nestedTooltip: true,
    hotkey: true,
  },
  vocabulary: {
    maxWords: 0, // 无限
    lists: true,
    tags: true,
    masteryLevel: true,
    cloudSync: true,
  },
  review: {
    dailyLimit: 200,
    smartRecommend: true,
    reviewPlan: true,
  },
  website: {
    maxRules: 0, // 无限
    whitelist: true,
  },
  features: {
    floatingBall: true,
    hotkeys: true,
    contextMenu: true,
    multiApi: true,
    customCSS: true,
  },
  gamification: {
    achievements: true,
    goals: true,
    reminders: true,
  },
  statistics: {
    basic: true,
    advanced: true,
    trends: true,
  },
  export: {
    json: true,
    csv: true,
    anki: true,
    custom: true,
  },
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: New User Default Plan Assignment

*For any* newly registered user, the system SHALL automatically assign the free plan with all free plan features enabled.

**Validates: Requirements 1.2**

### Property 2: Usage Counting Accuracy

*For any* sequence of usage operations (translation, review, collection), the Usage_Tracker SHALL accurately count the total, and the count SHALL equal the number of operations performed.

**Validates: Requirements 3.1, 4.1, 6.1, 9.1**

### Property 3: Free User Limit Enforcement

*For any* free user who has reached their usage limit (100 translations, 100 words, 20 reviews, 10 rules), the Feature_Gate SHALL block further operations of that type.

**Validates: Requirements 3.2, 4.2, 6.2, 9.2**

### Property 4: Premium User Unlimited Access

*For any* premium user, the Feature_Gate SHALL allow unlimited translations, unlimited word collections, up to 200 daily reviews, and unlimited website rules.

**Validates: Requirements 3.4, 4.3, 6.3, 9.3**

### Property 5: Daily Usage Reset

*For any* user, the Usage_Tracker SHALL reset daily counts (translation, review) at midnight, and the new day's count SHALL start at zero.

**Validates: Requirements 3.3, 6.4**

### Property 6: Free User Option Filtering

*For any* free user, the Feature_Gate SHALL only allow selection from the free tier options: 5 languages, 3 styles, 3 levels, and ratio up to 30%.

**Validates: Requirements 5.1, 7.1, 8.1**

### Property 7: Premium User Full Options

*For any* premium user, the Feature_Gate SHALL allow selection from all options: 20+ languages, 7+ styles, 5 levels, and ratio up to 100%.

**Validates: Requirements 5.2, 7.2, 8.2**

### Property 8: Premium Feature Gating

*For any* free user attempting to access a premium-only feature (AI definition, Youdao TTS, vocabulary lists, achievements, goals, advanced stats, CSV/Anki export), the Feature_Gate SHALL block access.

**Validates: Requirements 10.1-10.7**

### Property 9: Subscription Expiration Downgrade

*For any* user whose premium subscription has expired, the Subscription_System SHALL automatically downgrade them to the free plan and apply free plan restrictions.

**Validates: Requirements 2.2**

### Property 10: Immediate Premium Activation

*For any* user who upgrades to premium, the Subscription_System SHALL immediately activate all premium features without requiring logout or refresh.

**Validates: Requirements 2.4**

### Property 11: Subscription Status Round-Trip

*For any* valid subscription state, serializing to the API response and deserializing back SHALL produce an equivalent subscription status object.

**Validates: Requirements 12.1, 12.2**

## Error Handling

### Backend Errors

| Error Code | Description | HTTP Status | Handling |
|------------|-------------|-------------|----------|
| SUBSCRIPTION_NOT_FOUND | 用户无订阅记录 | 404 | 自动创建免费订阅 |
| PLAN_NOT_FOUND | 计划不存在 | 404 | 返回错误信息 |
| USAGE_LIMIT_EXCEEDED | 使用量超限 | 403 | 返回限制信息和升级提示 |
| FEATURE_NOT_AVAILABLE | 功能不可用 | 403 | 返回功能要求和升级提示 |
| SUBSCRIPTION_EXPIRED | 订阅已过期 | 403 | 自动降级并返回状态 |

### Frontend Error Handling

```typescript
// 使用量限制错误处理
async function handleUsageLimitError(error: UsageLimitError) {
  const { usageType, current, limit } = error;
  
  // 显示升级提示
  upgradePromptService.showPrompt(`${usageType}_limit`, {
    current,
    limit,
    message: getUpgradeMessage(usageType),
  });
}

// 功能不可用错误处理
async function handleFeatureNotAvailableError(error: FeatureNotAvailableError) {
  const { feature } = error;
  
  // 显示升级提示
  upgradePromptService.showPrompt('feature_locked', {
    feature,
    message: getFeatureUpgradeMessage(feature),
  });
}
```

## Testing Strategy

### Unit Tests

1. **PlanService Tests**
   - 测试计划查询功能
   - 测试功能配置解析

2. **SubscriptionService Tests**
   - 测试订阅创建和查询
   - 测试订阅状态转换
   - 测试过期处理

3. **UsageService Tests**
   - 测试使用量记录
   - 测试限制检查
   - 测试每日重置

4. **FeatureGateService Tests**
   - 测试功能访问控制
   - 测试选项过滤
   - 测试值范围验证

### Property-Based Tests

使用 fast-check 库进行属性测试：

1. **Property 1**: 新用户默认计划分配
2. **Property 2**: 使用量计数准确性
3. **Property 3**: 免费用户限制执行
4. **Property 4**: 高级用户无限访问
5. **Property 5**: 每日使用量重置
6. **Property 6**: 免费用户选项过滤
7. **Property 7**: 高级用户完整选项
8. **Property 8**: 高级功能门控
9. **Property 9**: 订阅过期降级
10. **Property 10**: 即时高级激活
11. **Property 11**: 订阅状态序列化往返

### Integration Tests

1. **API Integration Tests**
   - 测试订阅状态API
   - 测试使用量API
   - 测试功能检查API

2. **End-to-End Tests**
   - 测试完整升级流程
   - 测试限制触发和提示显示
   - 测试跨设备同步
