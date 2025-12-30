/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 * Integrates with backend API and manages local token storage
 */

import { browser } from 'wxt/browser';
import { TokenStorage, tokenStorage } from './TokenStorage';
import type {
  User,
  AuthResult,
  AuthEventData,
  AuthEventListener,
  LoginCredentials,
  RegisterData,
  AuthApiResponse,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  AuthErrorCode,
} from './types';
import { AuthEventType } from './types';

// Storage key for user data
const USER_STORAGE_KEY = 'auth_user';

// Default API endpoint (can be configured)
const DEFAULT_API_ENDPOINT = import.meta.env.VITE_BACKEND_API_ENDPOINT || 'https://admin.1zhizu.com';

/**
 * AuthService class for managing user authentication
 * Singleton pattern for consistent state across the extension
 */
export class AuthService {
  private static instance: AuthService;
  private tokenStorage: TokenStorage;
  private apiEndpoint: string;
  private eventListeners: Map<AuthEventType, AuthEventListener[]> = new Map();
  private currentUser: User | null = null;

  private constructor() {
    this.tokenStorage = tokenStorage;
    this.apiEndpoint = DEFAULT_API_ENDPOINT;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Configure API endpoint
   * @param endpoint - Backend API base URL
   */
  public setApiEndpoint(endpoint: string): void {
    this.apiEndpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
  }

  // ==================== Event Management ====================

  /**
   * Add event listener for auth events
   */
  public addEventListener(
    eventType: AuthEventType,
    listener: AuthEventListener,
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
    eventType: AuthEventType,
    listener: AuthEventListener,
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
   * Emit auth event to all listeners
   */
  private emitEvent(
    eventType: AuthEventType,
    user?: User,
    error?: string,
  ): void {
    const event: AuthEventData = {
      type: eventType,
      timestamp: Date.now(),
      user,
      error,
    };

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (e) {
          console.error('[AuthService] Event listener error:', e);
        }
      });
    }
  }

  // ==================== Authentication Methods ====================

  /**
   * Login with email and password
   */
  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await this.apiRequest<LoginResponse>(
        '/api/auth/login',
        'POST',
        credentials,
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error?.message || 'Login failed',
          errorCode: this.mapErrorCode(response.error?.code),
        };
      }

      const { user, accessToken, refreshToken, expiresIn } = response.data;

      // Store tokens securely
      await this.tokenStorage.setTokens(accessToken, refreshToken, expiresIn);

      // Store user data
      await this.saveUser(user);
      this.currentUser = user;

      // Emit login event
      this.emitEvent(AuthEventType.LOGIN, user);

      return {
        success: true,
        user,
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        error: errorMessage,
        errorCode: 'AUTH_NETWORK_ERROR',
      };
    }
  }

  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<AuthResult> {
    try {
      const response = await this.apiRequest<RegisterResponse>(
        '/api/auth/register',
        'POST',
        data,
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error?.message || 'Registration failed',
          errorCode: this.mapErrorCode(response.error?.code),
        };
      }

      const { user, accessToken, refreshToken, expiresIn } = response.data;

      // Store tokens securely
      await this.tokenStorage.setTokens(accessToken, refreshToken, expiresIn);

      // Store user data
      await this.saveUser(user);
      this.currentUser = user;

      // Emit login event (user is now logged in after registration)
      this.emitEvent(AuthEventType.LOGIN, user);

      return {
        success: true,
        user,
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      return {
        success: false,
        error: errorMessage,
        errorCode: 'AUTH_NETWORK_ERROR',
      };
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    try {
      // Try to notify server (best effort)
      const token = await this.tokenStorage.getAccessToken();
      if (token) {
        await this.apiRequest('/api/auth/logout', 'POST', {}, token).catch(
          () => {
            // Ignore server errors during logout
          },
        );
      }
    } finally {
      // Always clear local state
      await this.tokenStorage.clearTokens();
      await this.clearUser();
      this.currentUser = null;

      // Emit logout event
      this.emitEvent(AuthEventType.LOGOUT);
    }
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    // Return cached user if available
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to load from storage
    const user = await this.loadUser();
    if (user) {
      // Verify token is still valid
      const hasValidToken = await this.tokenStorage.hasValidTokens();
      if (hasValidToken) {
        this.currentUser = user;
        return user;
      }

      // Token expired, try to refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        this.currentUser = user;
        return user;
      }

      // Refresh failed, clear user
      await this.clearUser();
    }

    return null;
  }

  /**
   * Refresh the access token
   */
  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await this.tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await this.apiRequest<RefreshTokenResponse>(
        '/api/auth/refresh',
        'POST',
        { refreshToken },
      );

      if (!response.success || !response.data) {
        // Refresh failed, session expired
        this.emitEvent(AuthEventType.SESSION_EXPIRED);
        await this.logout();
        return null;
      }

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

      // Update stored tokens
      await this.tokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);

      // Emit token refreshed event
      this.emitEvent(AuthEventType.TOKEN_REFRESHED, this.currentUser || undefined);

      return accessToken;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      const response = await this.apiRequest<{ message: string }>(
        '/api/auth/password-reset',
        'POST',
        { email },
      );

      return {
        success: response.success,
        error: response.error?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        errorCode: 'AUTH_NETWORK_ERROR',
      };
    }
  }

  /**
   * Validate current token
   */
  public async validateToken(): Promise<boolean> {
    const token = await this.tokenStorage.getAccessToken();
    if (!token) {
      return false;
    }

    // Check if token needs refresh
    if (await this.tokenStorage.needsRefresh()) {
      const newToken = await this.refreshToken();
      return newToken !== null;
    }

    return true;
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Get access token for API requests
   */
  public async getAccessToken(): Promise<string | null> {
    // Check if token needs refresh
    if (await this.tokenStorage.needsRefresh()) {
      return await this.refreshToken();
    }

    return await this.tokenStorage.getAccessToken();
  }

  // ==================== Private Helper Methods ====================

  /**
   * Make API request to auth endpoints
   */
  private async apiRequest<T>(
    path: string,
    method: string,
    body?: any,
    token?: string,
  ): Promise<AuthApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.apiEndpoint}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.error?.code || 'UNKNOWN_ERROR',
          message: data.error?.message || 'Request failed',
          details: data.error?.details,
        },
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  }

  /**
   * Save user data to storage
   */
  private async saveUser(user: User): Promise<void> {
    await browser.storage.local.set({
      [USER_STORAGE_KEY]: JSON.stringify(user),
    });
  }

  /**
   * Load user data from storage
   */
  private async loadUser(): Promise<User | null> {
    try {
      const result = await browser.storage.local.get(USER_STORAGE_KEY);
      const serialized = result[USER_STORAGE_KEY];

      if (!serialized) {
        return null;
      }

      return JSON.parse(serialized) as User;
    } catch (error) {
      console.error('[AuthService] Failed to load user:', error);
      return null;
    }
  }

  /**
   * Clear user data from storage
   */
  private async clearUser(): Promise<void> {
    await browser.storage.local.remove(USER_STORAGE_KEY);
  }

  /**
   * Map API error codes to AuthErrorCode
   */
  private mapErrorCode(code?: string): AuthErrorCode {
    const errorMap: Record<string, AuthErrorCode> = {
      INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
      USER_DISABLED: 'AUTH_USER_DISABLED',
      TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
      EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
      INVALID_EMAIL: 'AUTH_INVALID_EMAIL',
      WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
    };

    return errorMap[code || ''] || 'AUTH_UNKNOWN_ERROR';
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

export default AuthService;
