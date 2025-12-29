/**
 * Offline Queue Manager
 * Manages queued operations for offline sync
 * 
 * Requirements: 7.3
 */

import { browser } from 'wxt/browser';
import { authService } from '../auth/AuthService';
import type {
  QueuedOperation,
  QueuedOperationSerialized,
  QueueStatus,
  QueuedOperationType,
} from './types';

// Storage key for offline queue
const OFFLINE_QUEUE_STORAGE_KEY = 'vocabulary_offline_queue';

// Maximum retry attempts
const MAX_RETRY_COUNT = 3;

// Retry delay in milliseconds (exponential backoff base)
const RETRY_DELAY_BASE = 1000;

// Default API endpoint
const DEFAULT_API_ENDPOINT = 'https://api.one-language.com';

/**
 * OfflineQueueManager class
 * Singleton service for managing offline operation queue
 */
export class OfflineQueueManager {
  private static instance: OfflineQueueManager;
  
  private apiEndpoint: string;
  private queue: QueuedOperation[] = [];
  private isProcessing: boolean = false;
  private lastSyncAt: Date | undefined;
  private isOnline: boolean = true;
  private isInitialized: boolean = false;

  private constructor() {
    this.apiEndpoint = DEFAULT_API_ENDPOINT;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  /**
   * Initialize the manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Load queue from storage
    await this.loadQueue();
    
    // Set up network status listeners
    this.setupNetworkListeners();
    
    // Check initial network status
    this.isOnline = navigator.onLine;
    
    // Process queue if online
    if (this.isOnline && this.queue.length > 0) {
      this.processQueue().catch(console.error);
    }
    
    this.isInitialized = true;
    console.log('[OfflineQueueManager] Initialized');
  }

  /**
   * Configure API endpoint
   */
  public setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint.replace(/\/$/, '');
  }

  /**
   * Add operation to queue
   * Requirements: 7.3
   */
  public async enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queuedOperation: QueuedOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: new Date(),
      retryCount: 0,
    };
    
    this.queue.push(queuedOperation);
    await this.saveQueue();
    
    console.log('[OfflineQueueManager] Operation enqueued:', queuedOperation.type);
    
    // Try to process immediately if online
    if (this.isOnline && !this.isProcessing) {
      this.processQueue().catch(console.error);
    }
  }

  /**
   * Process all queued operations
   * Requirements: 7.3
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    if (!this.isOnline) {
      console.log('[OfflineQueueManager] Offline, skipping queue processing');
      return;
    }
    
    this.isProcessing = true;
    console.log(`[OfflineQueueManager] Processing ${this.queue.length} queued operations`);
    
    const failedOperations: QueuedOperation[] = [];
    
    for (const operation of [...this.queue]) {
      try {
        await this.processOperation(operation);
        // Remove successful operation from queue
        this.queue = this.queue.filter(op => op.id !== operation.id);
      } catch (error) {
        console.error('[OfflineQueueManager] Operation failed:', operation.type, error);
        
        // Increment retry count
        operation.retryCount++;
        
        if (operation.retryCount < MAX_RETRY_COUNT) {
          failedOperations.push(operation);
        } else {
          console.warn('[OfflineQueueManager] Max retries reached, dropping operation:', operation.id);
        }
      }
    }
    
    // Update queue with failed operations
    this.queue = failedOperations;
    await this.saveQueue();
    
    this.lastSyncAt = new Date();
    this.isProcessing = false;
    
    console.log(`[OfflineQueueManager] Queue processing complete. Remaining: ${this.queue.length}`);
  }

  /**
   * Get queue status
   */
  public async getQueueStatus(): Promise<QueueStatus> {
    const failedCount = this.queue.filter(op => op.retryCount > 0).length;
    
    return {
      pendingCount: this.queue.length,
      failedCount,
      lastSyncAt: this.lastSyncAt,
    };
  }

  /**
   * Clear all queued operations
   */
  public async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    console.log('[OfflineQueueManager] Queue cleared');
  }

  /**
   * Get pending operations count
   */
  public getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Check if currently online
   */
  public getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Force retry all failed operations
   */
  public async retryFailed(): Promise<void> {
    // Reset retry counts for failed operations
    for (const operation of this.queue) {
      if (operation.retryCount > 0) {
        operation.retryCount = 0;
      }
    }
    await this.saveQueue();
    
    // Process queue
    await this.processQueue();
  }

  // ==================== Private Helper Methods ====================

  /**
   * Process a single operation
   */
  private async processOperation(operation: QueuedOperation): Promise<void> {
    const token = await authService.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const endpoint = this.getEndpointForOperation(operation);
    const method = this.getMethodForOperation(operation);
    
    const response = await fetch(`${this.apiEndpoint}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: method !== 'DELETE' ? JSON.stringify(operation.payload) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
  }

  /**
   * Get API endpoint for operation type
   */
  private getEndpointForOperation(operation: QueuedOperation): string {
    switch (operation.type) {
      case 'favorite':
        return '/api/vocabulary';
      case 'unfavorite':
        return `/api/vocabulary/${operation.payload.wordId}`;
      case 'addTag':
      case 'removeTag':
        return `/api/vocabulary/${operation.payload.wordId}/tags`;
      case 'updateReview':
        return `/api/review/${operation.payload.wordId}`;
      default:
        return '/api/vocabulary';
    }
  }

  /**
   * Get HTTP method for operation type
   */
  private getMethodForOperation(operation: QueuedOperation): string {
    switch (operation.type) {
      case 'favorite':
        return 'POST';
      case 'unfavorite':
        return 'DELETE';
      case 'addTag':
      case 'removeTag':
        return 'PUT';
      case 'updateReview':
        return 'POST';
      default:
        return 'POST';
    }
  }

  /**
   * Set up network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle coming online
   */
  private handleOnline(): void {
    console.log('[OfflineQueueManager] Network online');
    this.isOnline = true;
    
    // Process queue when coming online
    if (this.queue.length > 0) {
      // Add a small delay to ensure network is stable
      setTimeout(() => {
        this.processQueue().catch(console.error);
      }, 1000);
    }
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    console.log('[OfflineQueueManager] Network offline');
    this.isOnline = false;
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const result = await browser.storage.local.get(OFFLINE_QUEUE_STORAGE_KEY);
      const data = result[OFFLINE_QUEUE_STORAGE_KEY];
      
      if (data) {
        const serialized: QueuedOperationSerialized[] = JSON.parse(data);
        this.queue = serialized.map(this.deserializeOperation);
      }
    } catch (error) {
      console.error('[OfflineQueueManager] Failed to load queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      const serialized = this.queue.map(this.serializeOperation);
      await browser.storage.local.set({
        [OFFLINE_QUEUE_STORAGE_KEY]: JSON.stringify(serialized),
      });
    } catch (error) {
      console.error('[OfflineQueueManager] Failed to save queue:', error);
    }
  }

  /**
   * Serialize operation for storage
   */
  private serializeOperation(operation: QueuedOperation): QueuedOperationSerialized {
    return {
      ...operation,
      timestamp: operation.timestamp.toISOString(),
    };
  }

  /**
   * Deserialize operation from storage
   */
  private deserializeOperation(serialized: QueuedOperationSerialized): QueuedOperation {
    return {
      ...serialized,
      timestamp: new Date(serialized.timestamp),
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const offlineQueueManager = OfflineQueueManager.getInstance();

export default OfflineQueueManager;
