# Requirements Document

## Introduction

本文档定义了一站式学语言助手的会员订阅系统需求，包括免费版和高级版的功能分层、使用量限制、订阅管理等核心功能。

## Glossary

- **Subscription_System**: 会员订阅管理系统，负责用户订阅状态管理和功能权限控制
- **Usage_Tracker**: 使用量追踪服务，记录和验证用户的每日使用量
- **Feature_Gate**: 功能门控服务，根据用户订阅状态控制功能访问权限
- **Plan**: 订阅计划，定义不同会员等级的功能配置
- **Free_Plan**: 免费版计划，提供基础功能
- **Premium_Plan**: 高级版计划，提供完整功能
- **Usage_Record**: 使用量记录，追踪用户每日翻译、复习、收藏等操作次数

## Requirements

### Requirement 1: 订阅计划管理

**User Story:** As a system administrator, I want to manage subscription plans, so that I can define different feature sets for free and premium users.

#### Acceptance Criteria

1. THE Subscription_System SHALL support two plan types: free and premium
2. WHEN a new user registers, THE Subscription_System SHALL automatically assign the free plan
3. THE Subscription_System SHALL store plan configurations including feature limits and permissions
4. WHEN a plan configuration is updated, THE Subscription_System SHALL apply changes to all users on that plan

### Requirement 2: 用户订阅状态管理

**User Story:** As a user, I want to view and manage my subscription status, so that I can understand my current plan and upgrade if needed.

#### Acceptance Criteria

1. THE Subscription_System SHALL track user subscription status (active, expired, cancelled)
2. WHEN a user's subscription expires, THE Subscription_System SHALL downgrade them to free plan
3. THE Subscription_System SHALL provide API to query current subscription status
4. WHEN a user upgrades to premium, THE Subscription_System SHALL immediately activate premium features

### Requirement 3: 每日翻译量限制

**User Story:** As a product manager, I want to limit daily translation usage for free users, so that we can encourage upgrades while providing basic functionality.

#### Acceptance Criteria

1. THE Usage_Tracker SHALL count translated paragraphs per user per day
2. WHEN a free user reaches 100 paragraphs, THE Feature_Gate SHALL block further translations
3. THE Usage_Tracker SHALL reset daily counts at midnight (user's local time)
4. WHEN a premium user translates, THE Feature_Gate SHALL allow unlimited translations
5. IF a user attempts to translate after reaching the limit, THEN THE Feature_Gate SHALL display an upgrade prompt

### Requirement 4: 词汇收藏数量限制

**User Story:** As a product manager, I want to limit vocabulary collection for free users, so that serious learners are motivated to upgrade.

#### Acceptance Criteria

1. THE Usage_Tracker SHALL count total collected words per user
2. WHEN a free user reaches 100 words, THE Feature_Gate SHALL block further collections
3. WHEN a premium user collects words, THE Feature_Gate SHALL allow unlimited collections
4. IF a user attempts to collect after reaching the limit, THEN THE Feature_Gate SHALL display an upgrade prompt
5. THE Feature_Gate SHALL display current collection count and limit in the UI

### Requirement 5: 翻译比例限制

**User Story:** As a product manager, I want to limit translation ratio for free users, so that premium users get more intensive learning options.

#### Acceptance Criteria

1. WHEN a free user sets translation ratio, THE Feature_Gate SHALL limit the maximum to 30%
2. WHEN a premium user sets translation ratio, THE Feature_Gate SHALL allow up to 100%
3. IF a free user attempts to set ratio above 30%, THEN THE Feature_Gate SHALL show upgrade prompt
4. THE Feature_Gate SHALL visually indicate locked ratio range in the UI

### Requirement 6: 每日复习量限制

**User Story:** As a product manager, I want to limit daily review count for free users, so that active learners are encouraged to upgrade.

#### Acceptance Criteria

1. THE Usage_Tracker SHALL count reviewed words per user per day
2. WHEN a free user reaches 20 reviews, THE Feature_Gate SHALL block further reviews
3. WHEN a premium user reviews, THE Feature_Gate SHALL allow up to 200 reviews per day
4. THE Usage_Tracker SHALL reset daily review counts at midnight
5. IF a user attempts to review after reaching the limit, THEN THE Feature_Gate SHALL display an upgrade prompt

### Requirement 7: 语言支持限制

**User Story:** As a product manager, I want to limit available languages for free users, so that users needing more languages will upgrade.

#### Acceptance Criteria

1. THE Feature_Gate SHALL allow free users to select from 5 languages (zh, en, ja, ko, es)
2. THE Feature_Gate SHALL allow premium users to select from 20+ languages
3. WHEN a free user attempts to select a premium language, THE Feature_Gate SHALL show upgrade prompt
4. THE Feature_Gate SHALL visually indicate locked languages in the language selector

### Requirement 8: 翻译样式限制

**User Story:** As a product manager, I want to limit translation styles for free users, so that users wanting advanced styles will upgrade.

#### Acceptance Criteria

1. THE Feature_Gate SHALL allow free users to use 3 styles (default, subtle, bold)
2. THE Feature_Gate SHALL allow premium users to use all 7 styles plus custom CSS
3. WHEN a free user attempts to select a premium style, THE Feature_Gate SHALL show upgrade prompt
4. THE Feature_Gate SHALL visually indicate locked styles in the style selector

### Requirement 9: 网站规则数量限制

**User Story:** As a product manager, I want to limit website rules for free users, so that power users will upgrade.

#### Acceptance Criteria

1. THE Usage_Tracker SHALL count website rules per user
2. WHEN a free user reaches 10 rules, THE Feature_Gate SHALL block adding more rules
3. THE Feature_Gate SHALL allow premium users unlimited rules
4. THE Feature_Gate SHALL block whitelist functionality for free users
5. IF a free user attempts to add rules after reaching the limit, THEN THE Feature_Gate SHALL display an upgrade prompt

### Requirement 10: 高级功能门控

**User Story:** As a product manager, I want to gate advanced features for premium users, so that we have clear value differentiation.

#### Acceptance Criteria

1. THE Feature_Gate SHALL block AI word definition for free users
2. THE Feature_Gate SHALL block Youdao TTS for free users (fallback to Web Speech)
3. THE Feature_Gate SHALL block vocabulary lists feature for free users
4. THE Feature_Gate SHALL block achievement system for free users
5. THE Feature_Gate SHALL block goal system for free users
6. THE Feature_Gate SHALL block advanced statistics for free users
7. THE Feature_Gate SHALL block CSV/Anki export for free users
8. WHEN a free user attempts to access a premium feature, THE Feature_Gate SHALL show upgrade prompt

### Requirement 11: 升级提示系统

**User Story:** As a user, I want to see clear upgrade prompts when I hit limits, so that I understand the value of upgrading.

#### Acceptance Criteria

1. WHEN a limit is reached, THE Feature_Gate SHALL display a non-intrusive upgrade prompt
2. THE Feature_Gate SHALL include the specific benefit of upgrading in the prompt
3. THE Feature_Gate SHALL allow users to dismiss prompts
4. THE Feature_Gate SHALL limit same prompt to once per 24 hours
5. THE Feature_Gate SHALL provide a direct link to the upgrade page

### Requirement 12: 订阅状态API

**User Story:** As a frontend developer, I want APIs to check subscription status, so that I can implement feature gating in the UI.

#### Acceptance Criteria

1. THE Subscription_System SHALL provide GET /api/subscription/status endpoint
2. THE Subscription_System SHALL return current plan, features, and usage in the response
3. THE Subscription_System SHALL provide GET /api/subscription/usage endpoint for daily usage
4. THE Subscription_System SHALL cache subscription status for performance
5. WHEN subscription status changes, THE Subscription_System SHALL invalidate the cache
