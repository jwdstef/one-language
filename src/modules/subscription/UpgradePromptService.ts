/**
 * Upgrade Prompt Service
 * Manages upgrade prompts with 24-hour cooldown per prompt type
 * 
 * Requirements: 11.1, 11.3, 11.4
 */

import { browser } from 'wxt/browser';
import type {
  UpgradeReason,
  UpgradePromptContext,
  UpgradePromptData,
  PromptHistory,
} from './types';
import {
  UPGRADE_PROMPT_STORAGE_KEY,
  PROMPT_COOLDOWN_MS,
} from './types';

/**
 * Event listener type for prompt events
 */
export type UpgradePromptListener = (data: UpgradePromptData) => void;

/**
 * Dismiss listener type
 */
export type UpgradeDismissListener = () => void;

/**
 * UpgradePromptService class
 * Singleton service for managing upgrade prompts
 */
export class UpgradePromptService {
  private static instance: UpgradePromptService;
  
  private promptHistory: PromptHistory = {};
  private isInitialized: boolean = false;
  private promptListeners: UpgradePromptListener[] = [];
  private dismissListeners: UpgradeDismissListener[] = [];
  private currentPrompt: UpgradePromptData | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): UpgradePromptService {
    if (!UpgradePromptService.instance) {
      UpgradePromptService.instance = new UpgradePromptService();
    }
    return UpgradePromptService.instance;
  }

  /**
   * Initialize the service by loading prompt history from storage
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await this.loadPromptHistory();
    this.isInitialized = true;
    console.log('[UpgradePromptService] Initialized');
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // ==================== Core Methods ====================

  /**
   * Show an upgrade prompt for a specific reason
   * Requirements: 11.1
   * 
   * @param reason - The reason for showing the prompt
   * @param context - Optional context data for the prompt
   */
  public async showPrompt(reason: UpgradeReason, context?: UpgradePromptContext): Promise<void> {
    await this.ensureInitialized();

    // Check if we should show this prompt (24-hour limit)
    if (!this.shouldShowPrompt(reason)) {
      console.log(`[UpgradePromptService] Skipping prompt for ${reason} (cooldown active)`);
      return;
    }

    // Record that we're showing this prompt
    await this.recordPromptShown(reason);

    // Create prompt data
    const promptData: UpgradePromptData = {
      reason,
      context,
      timestamp: Date.now(),
    };

    // Store current prompt
    this.currentPrompt = promptData;

    // Notify all listeners
    this.notifyPromptListeners(promptData);

    console.log(`[UpgradePromptService] Showing prompt for ${reason}`, context);
  }

  /**
   * Check if a prompt should be shown (respects 24-hour cooldown)
   * Requirements: 11.4
   * 
   * @param reason - The reason to check
   * @returns boolean - True if prompt should be shown
   */
  public shouldShowPrompt(reason: UpgradeReason): boolean {
    const lastShown = this.promptHistory[reason];
    
    if (!lastShown) {
      return true;
    }

    const timeSinceLastShown = Date.now() - lastShown;
    return timeSinceLastShown >= PROMPT_COOLDOWN_MS;
  }

  /**
   * Record that a prompt was shown
   * Requirements: 11.4
   * 
   * @param reason - The reason that was shown
   */
  public async recordPromptShown(reason: UpgradeReason): Promise<void> {
    await this.ensureInitialized();

    this.promptHistory[reason] = Date.now();
    await this.savePromptHistory();
  }

  /**
   * Dismiss the current prompt
   * Requirements: 11.3
   */
  public dismissPrompt(): void {
    this.currentPrompt = null;
    this.notifyDismissListeners();
    console.log('[UpgradePromptService] Prompt dismissed');
  }

  /**
   * Get the current active prompt
   * 
   * @returns The current prompt data or null
   */
  public getCurrentPrompt(): UpgradePromptData | null {
    return this.currentPrompt;
  }

  /**
   * Check if there's an active prompt
   * 
   * @returns boolean - True if there's an active prompt
   */
  public hasActivePrompt(): boolean {
    return this.currentPrompt !== null;
  }

  // ==================== Event Management ====================

  /**
   * Add a listener for prompt events
   * 
   * @param listener - The listener function
   */
  public addPromptListener(listener: UpgradePromptListener): void {
    this.promptListeners.push(listener);
  }

  /**
   * Remove a prompt listener
   * 
   * @param listener - The listener to remove
   */
  public removePromptListener(listener: UpgradePromptListener): void {
    const index = this.promptListeners.indexOf(listener);
    if (index > -1) {
      this.promptListeners.splice(index, 1);
    }
  }

  /**
   * Add a listener for dismiss events
   * 
   * @param listener - The listener function
   */
  public addDismissListener(listener: UpgradeDismissListener): void {
    this.dismissListeners.push(listener);
  }

  /**
   * Remove a dismiss listener
   * 
   * @param listener - The listener to remove
   */
  public removeDismissListener(listener: UpgradeDismissListener): void {
    const index = this.dismissListeners.indexOf(listener);
    if (index > -1) {
      this.dismissListeners.splice(index, 1);
    }
  }

  /**
   * Notify all prompt listeners
   */
  private notifyPromptListeners(data: UpgradePromptData): void {
    this.promptListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('[UpgradePromptService] Prompt listener error:', error);
      }
    });
  }

  /**
   * Notify all dismiss listeners
   */
  private notifyDismissListeners(): void {
    this.dismissListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('[UpgradePromptService] Dismiss listener error:', error);
      }
    });
  }

  // ==================== Storage Methods ====================

  /**
   * Load prompt history from storage
   */
  private async loadPromptHistory(): Promise<void> {
    try {
      const result = await browser.storage.local.get(UPGRADE_PROMPT_STORAGE_KEY);
      const data = result[UPGRADE_PROMPT_STORAGE_KEY];
      
      if (data) {
        this.promptHistory = JSON.parse(data) as PromptHistory;
        // Clean up expired entries
        this.cleanupExpiredEntries();
      } else {
        this.promptHistory = {};
      }
    } catch (error) {
      console.error('[UpgradePromptService] Failed to load prompt history:', error);
      this.promptHistory = {};
    }
  }

  /**
   * Save prompt history to storage
   */
  private async savePromptHistory(): Promise<void> {
    try {
      await browser.storage.local.set({
        [UPGRADE_PROMPT_STORAGE_KEY]: JSON.stringify(this.promptHistory),
      });
    } catch (error) {
      console.error('[UpgradePromptService] Failed to save prompt history:', error);
    }
  }

  /**
   * Clean up expired entries from prompt history
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let hasChanges = false;

    for (const reason in this.promptHistory) {
      if (now - this.promptHistory[reason] >= PROMPT_COOLDOWN_MS) {
        delete this.promptHistory[reason];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.savePromptHistory();
    }
  }

  /**
   * Clear all prompt history (for testing or reset)
   */
  public async clearHistory(): Promise<void> {
    this.promptHistory = {};
    await this.savePromptHistory();
    console.log('[UpgradePromptService] History cleared');
  }

  /**
   * Get time until a prompt can be shown again
   * 
   * @param reason - The reason to check
   * @returns number - Milliseconds until prompt can be shown, 0 if can show now
   */
  public getTimeUntilCanShow(reason: UpgradeReason): number {
    const lastShown = this.promptHistory[reason];
    
    if (!lastShown) {
      return 0;
    }

    const timeSinceLastShown = Date.now() - lastShown;
    const remaining = PROMPT_COOLDOWN_MS - timeSinceLastShown;
    
    return Math.max(0, remaining);
  }
}

// Export singleton instance
export const upgradePromptService = UpgradePromptService.getInstance();

export default UpgradePromptService;
