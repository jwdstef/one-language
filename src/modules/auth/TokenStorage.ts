/**
 * Token Storage Utility
 * Securely manages JWT tokens using browser.storage.local
 * Provides token expiration checking and automatic cleanup
 */

import { browser } from 'wxt/browser';
import type { TokenData } from './types';

// Storage key for auth tokens
const TOKEN_STORAGE_KEY = 'auth_tokens';

// Buffer time before token expiration (5 minutes in milliseconds)
const EXPIRATION_BUFFER_MS = 5 * 60 * 1000;

/**
 * TokenStorage class for secure token management
 * Uses browser.storage.local for persistence across sessions
 */
export class TokenStorage {
  private static instance: TokenStorage;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage();
    }
    return TokenStorage.instance;
  }

  /**
   * Store tokens securely
   * @param accessToken - JWT access token
   * @param refreshToken - JWT refresh token
   * @param expiresIn - Token expiration time in seconds
   */
  public async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number = 3600,
  ): Promise<void> {
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    await browser.storage.local.set({
      [TOKEN_STORAGE_KEY]: JSON.stringify(tokenData),
    });
  }

  /**
   * Get the access token if valid
   * @returns Access token or null if expired/not found
   */
  public async getAccessToken(): Promise<string | null> {
    const tokenData = await this.getTokenData();

    if (!tokenData) {
      return null;
    }

    // Check if token is expired (with buffer)
    if (this.isTokenExpired(tokenData.expiresAt)) {
      return null;
    }

    return tokenData.accessToken;
  }

  /**
   * Get the refresh token
   * @returns Refresh token or null if not found
   */
  public async getRefreshToken(): Promise<string | null> {
    const tokenData = await this.getTokenData();
    return tokenData?.refreshToken || null;
  }

  /**
   * Get full token data
   * @returns Token data or null if not found
   */
  public async getTokenData(): Promise<TokenData | null> {
    try {
      const result = await browser.storage.local.get(TOKEN_STORAGE_KEY);
      const serialized = result[TOKEN_STORAGE_KEY];

      if (!serialized) {
        return null;
      }

      return JSON.parse(serialized) as TokenData;
    } catch (error) {
      console.error('[TokenStorage] Failed to get token data:', error);
      return null;
    }
  }

  /**
   * Clear all stored tokens
   */
  public async clearTokens(): Promise<void> {
    await browser.storage.local.remove(TOKEN_STORAGE_KEY);
  }

  /**
   * Check if the access token is expired
   * @param expiresAt - Expiration timestamp in milliseconds
   * @returns True if token is expired or about to expire
   */
  public isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt - EXPIRATION_BUFFER_MS;
  }

  /**
   * Check if tokens need refresh
   * @returns True if access token is expired but refresh token exists
   */
  public async needsRefresh(): Promise<boolean> {
    const tokenData = await this.getTokenData();

    if (!tokenData) {
      return false;
    }

    // Token is expired but we have a refresh token
    return (
      this.isTokenExpired(tokenData.expiresAt) && !!tokenData.refreshToken
    );
  }

  /**
   * Check if user has valid tokens stored
   * @returns True if valid tokens exist
   */
  public async hasValidTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return accessToken !== null;
  }

  /**
   * Get time until token expiration
   * @returns Milliseconds until expiration, or -1 if no token
   */
  public async getTimeUntilExpiration(): Promise<number> {
    const tokenData = await this.getTokenData();

    if (!tokenData) {
      return -1;
    }

    const timeLeft = tokenData.expiresAt - Date.now();
    return Math.max(0, timeLeft);
  }

  /**
   * Update only the access token (after refresh)
   * @param accessToken - New access token
   * @param expiresIn - New expiration time in seconds
   */
  public async updateAccessToken(
    accessToken: string,
    expiresIn: number = 3600,
  ): Promise<void> {
    const tokenData = await this.getTokenData();

    if (!tokenData) {
      throw new Error('No existing token data to update');
    }

    const updatedData: TokenData = {
      ...tokenData,
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    await browser.storage.local.set({
      [TOKEN_STORAGE_KEY]: JSON.stringify(updatedData),
    });
  }
}

// Export singleton instance
export const tokenStorage = TokenStorage.getInstance();

export default TokenStorage;
