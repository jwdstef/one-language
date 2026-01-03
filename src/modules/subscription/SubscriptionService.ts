/**
 * Subscription Service (Frontend)
 * Manages subscription status, features, and usage tracking with caching
 * 
 * Requirements: 2.3, 12.1
 */

import { browser } from 'wxt/browser';
import { authService } from '../auth/AuthService';
import type {
  SubscriptionStatus,
  UsageStatus,
  PlanFeatures,
  SubscriptionCache,
  SubscriptionEventData,
  SubscriptionEventListener,
  SubscriptionApiResponse,
  UsageType,
  UsageLimitResult,
} from './types';
import {
  SubscriptionEventType,
  DEFAULT_SUBSCRIPTION_CACHE,
  CACHE_TTL,
  SUBSCRIPTION_STORAGE_KEY,
} from './types';

// Default API endpoint
const DEFAULT_API_ENDPOINT = import.meta.env.VITE_BACKEND_API_ENDPOINT || 'https://admin.1zhizu.com';

/**
 * Helper function to make API requests through background script
 * This bypasses CORS restrictions for content scripts
 */
async function backgroundFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Try to send through background script
    const response = await browser.runtime.sendMessage({
      type: 'api-request',
      data: {
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body as string | undefined,
        timeout: 30000,
      },
    });

    // Convert background response to Response-like object
    if (response && typeof response === 'object') {
      const { success, data, error } = response;
      
      if (success) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => data,
          text: async () => JSON.stringify(data),
        } as Response;
      } else {
        return {
          ok: false,
          status: error?.status || 500,
          statusText: error?.statusText || error?.message || 'Error',
          json: async () => ({ success: false, error }),
          text: async () => JSON.stringify({ success: false, error }),
        } as Response;
      }
    }
    
    throw new Error('Invalid response from background');
  } catch (error) {
    // Fallback to direct fetch (for options page, popup, etc.)
    console.log('[SubscriptionService] Background fetch failed, trying direct fetch:', error);
    return fetch(url, options);
  }
}

/**
 * SubscriptionService class
 * Singleton service for managing subscription status and features
 */
export class SubscriptionService {
  private static instance: SubscriptionService;
  
  private apiEndpoint: string;
  private eventListeners: Map<SubscriptionEventType, SubscriptionEventListener[]> = new Map();
  private cache: SubscriptionCache;
  private isInitialized: boolean = false;

  private constructor() {
    this.apiEndpoint = DEFAULT_API_ENDPOINT;
    this.cache = { ...DEFAULT_SUBSCRIPTION_CACHE };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await this.loadCache();
    this.isInitialized = true;
    console.log('[SubscriptionService] Initialized');
  }

  /**
   * Configure API endpoint
   */
  public setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint.replace(/\/$/, '');
  }

  // ==================== Event Management ====================

  /**
   * Add event listener
   */
  public addEventListener(
    eventType: SubscriptionEventType,
    listener: SubscriptionEventListener,
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(
    eventType: SubscriptionEventType,
    listener: SubscriptionEventListener,
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(
    type: SubscriptionEventType,
    status?: SubscriptionStatus,
    usage?: UsageStatus,
    limitType?: UsageType,
    error?: string,
  ): void {
    const event: SubscriptionEventData = {
      type,
      timestamp: Date.now(),
      status,
      usage,
      limitType,
      error,
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.error('[SubscriptionService] Event listener error:', e);
        }
      });
    }
  }

  // ==================== Core Methods ====================

  /**
   * Get current subscription status (with caching)
   * Requirements: 2.3, 12.1
   */
  public async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    await this.ensureInitialized();

    // Check if user is authenticated
    const token = await authService.getAccessToken();
    if (!token) {
      return null;
    }

    // Check cache validity
    if (this.isCacheValid('status')) {
      return this.cache.status;
    }

    // Fetch from server
    return this.refreshSubscriptionStatus();
  }

  /**
   * Refresh subscription status from server
   * Requirements: 12.1
   */
  public async refreshSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    await this.ensureInitialized();

    const token = await authService.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const response = await backgroundFetch(`${this.apiEndpoint}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[SubscriptionService] Failed to fetch status:', response.statusText);
        return this.cache.status;
      }

      const result: SubscriptionApiResponse<SubscriptionStatus> = await response.json();
      
      if (result.success && result.data) {
        this.cache.status = result.data;
        this.cache.statusCachedAt = Date.now();
        await this.saveCache();
        
        this.emitEvent(SubscriptionEventType.STATUS_UPDATED, result.data);
        return result.data;
      }

      return this.cache.status;
    } catch (error) {
      console.error('[SubscriptionService] Error fetching status:', error);
      return this.cache.status;
    }
  }

  /**
   * Check if user has premium subscription
   * Requirements: 2.3
   */
  public async isPremium(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    if (!status) {
      return false;
    }
    return status.subscription.isPremium && status.subscription.isActive;
  }

  /**
   * Get current plan name
   */
  public async getPlanName(): Promise<'free' | 'premium' | null> {
    const status = await this.getSubscriptionStatus();
    if (!status) {
      return null;
    }
    return status.subscription.plan.name;
  }

  /**
   * Get available features for current subscription
   * Requirements: 12.2
   */
  public async getFeatures(): Promise<PlanFeatures | null> {
    const status = await this.getSubscriptionStatus();
    if (!status) {
      return null;
    }
    return status.features;
  }

  /**
   * Get usage statistics
   * Requirements: 12.3
   */
  public async getUsage(): Promise<UsageStatus | null> {
    await this.ensureInitialized();

    const token = await authService.getAccessToken();
    if (!token) {
      return null;
    }

    // Check cache validity (shorter TTL for usage)
    if (this.isCacheValid('usage')) {
      return this.cache.usage;
    }

    // Fetch from server
    return this.refreshUsage();
  }

  /**
   * Refresh usage statistics from server
   */
  public async refreshUsage(): Promise<UsageStatus | null> {
    await this.ensureInitialized();

    const token = await authService.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const response = await backgroundFetch(`${this.apiEndpoint}/api/subscription/usage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[SubscriptionService] Failed to fetch usage:', response.statusText);
        return this.cache.usage;
      }

      const result: SubscriptionApiResponse<UsageStatus> = await response.json();
      
      if (result.success && result.data) {
        this.cache.usage = result.data;
        this.cache.usageCachedAt = Date.now();
        await this.saveCache();
        
        this.emitEvent(SubscriptionEventType.USAGE_UPDATED, undefined, result.data);
        return result.data;
      }

      return this.cache.usage;
    } catch (error) {
      console.error('[SubscriptionService] Error fetching usage:', error);
      return this.cache.usage;
    }
  }

  /**
   * Check usage limit for a specific type
   */
  public async checkUsageLimit(type: UsageType): Promise<UsageLimitResult | null> {
    const usage = await this.getUsage();
    if (!usage) {
      return null;
    }
    return usage[type];
  }

  /**
   * Check if a specific action is allowed based on usage limits
   */
  public async canPerformAction(type: UsageType): Promise<boolean> {
    const limit = await this.checkUsageLimit(type);
    if (!limit) {
      // If we can't check, allow the action (fail open)
      return true;
    }
    return limit.allowed;
  }

  /**
   * Record usage for a specific type
   * This calls the backend to record usage and returns updated limit info
   */
  public async recordUsage(type: UsageType, count: number = 1): Promise<UsageLimitResult | null> {
    const token = await authService.getAccessToken();
    if (!token) {
      console.log('[SubscriptionService] No token, skipping usage recording');
      return null;
    }

    try {
      console.log(`[SubscriptionService] Recording usage: type=${type}, count=${count}`);
      
      const response = await backgroundFetch(`${this.apiEndpoint}/api/usage/record`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, count }),
      });

      if (!response.ok) {
        console.error('[SubscriptionService] Failed to record usage:', response.statusText);
        return null;
      }

      const result = await response.json();
      console.log('[SubscriptionService] Record usage response:', result);
      
      // Backend returns { success: true, data: { recorded: true, usage: UsageLimitResult } }
      if (result.success && result.data) {
        // Invalidate usage cache since it changed
        this.cache.usageCachedAt = null;
        
        // Extract the usage limit result from the response
        const usageResult: UsageLimitResult = result.data.usage || result.data;
        
        // Check if limit was reached
        if (usageResult && !usageResult.allowed) {
          this.emitEvent(SubscriptionEventType.LIMIT_REACHED, undefined, undefined, type);
        }
        
        return usageResult;
      }

      return null;
    } catch (error) {
      console.error('[SubscriptionService] Error recording usage:', error);
      return null;
    }
  }

  /**
   * Invalidate all cached data
   * Should be called when subscription status changes (e.g., upgrade)
   */
  public async invalidateCache(): Promise<void> {
    this.cache = { ...DEFAULT_SUBSCRIPTION_CACHE };
    await this.saveCache();
    this.emitEvent(SubscriptionEventType.CACHE_INVALIDATED);
  }

  /**
   * Get subscription expiration date
   */
  public async getExpirationDate(): Promise<Date | null> {
    const status = await this.getSubscriptionStatus();
    if (!status || !status.subscription.endDate) {
      return null;
    }
    return new Date(status.subscription.endDate);
  }

  /**
   * Check if subscription is about to expire (within 7 days)
   */
  public async isExpiringSoon(): Promise<boolean> {
    const expirationDate = await this.getExpirationDate();
    if (!expirationDate) {
      return false;
    }
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    return expirationDate <= sevenDaysFromNow;
  }

  // ==================== Private Helper Methods ====================

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Check if cache is valid for a specific type
   */
  private isCacheValid(type: 'status' | 'usage'): boolean {
    const now = Date.now();
    
    if (type === 'status') {
      if (!this.cache.status || !this.cache.statusCachedAt) {
        return false;
      }
      return (now - this.cache.statusCachedAt) < CACHE_TTL.STATUS;
    }
    
    if (type === 'usage') {
      if (!this.cache.usage || !this.cache.usageCachedAt) {
        return false;
      }
      return (now - this.cache.usageCachedAt) < CACHE_TTL.USAGE;
    }
    
    return false;
  }

  /**
   * Load cache from storage
   */
  private async loadCache(): Promise<void> {
    try {
      const result = await browser.storage.local.get(SUBSCRIPTION_STORAGE_KEY);
      const data = result[SUBSCRIPTION_STORAGE_KEY];
      
      if (data) {
        this.cache = JSON.parse(data) as SubscriptionCache;
      } else {
        this.cache = { ...DEFAULT_SUBSCRIPTION_CACHE };
      }
    } catch (error) {
      console.error('[SubscriptionService] Failed to load cache:', error);
      this.cache = { ...DEFAULT_SUBSCRIPTION_CACHE };
    }
  }

  /**
   * Save cache to storage
   */
  private async saveCache(): Promise<void> {
    try {
      await browser.storage.local.set({
        [SUBSCRIPTION_STORAGE_KEY]: JSON.stringify(this.cache),
      });
    } catch (error) {
      console.error('[SubscriptionService] Failed to save cache:', error);
    }
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();

export default SubscriptionService;
