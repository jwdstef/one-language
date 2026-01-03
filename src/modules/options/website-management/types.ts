export interface WebsiteRule {
  id: string;
  pattern: string;
  type: 'blacklist' | 'whitelist';
  enabled: boolean;
  createdAt: Date;
  description?: string;
}

export interface WebsiteManagementSettings {
  rules: WebsiteRule[];
}

export type WebsiteStatus = 'blacklisted' | 'whitelisted' | 'normal';

export interface RuleTypeOption {
  value: 'blacklist' | 'whitelist';
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Result of checking rule limits
 * Requirements: 9.1, 9.2, 9.3
 */
export interface RuleLimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number; // -1 indicates unlimited
  isPremium: boolean;
}
