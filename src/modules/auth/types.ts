/**
 * Authentication module type definitions
 * Contains user, token, and auth-related interfaces
 */

// Subscription tier for users
export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

// User status
export type UserStatus = 'active' | 'suspended' | 'deleted';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  subscription: SubscriptionTier;
  status?: UserStatus;
}

// Authentication result
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  errorCode?: AuthErrorCode;
}

// Auth error codes
export type AuthErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_USER_DISABLED'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_NETWORK_ERROR'
  | 'AUTH_EMAIL_EXISTS'
  | 'AUTH_INVALID_EMAIL'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_UNKNOWN_ERROR';

// Token data stored locally
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

// Auth state for storage
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: TokenData | null;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  verificationCode?: string;
}

// Auth event types
export enum AuthEventType {
  LOGIN = 'auth:login',
  LOGOUT = 'auth:logout',
  TOKEN_REFRESHED = 'auth:token_refreshed',
  SESSION_EXPIRED = 'auth:session_expired',
  USER_UPDATED = 'auth:user_updated',
}

// Auth event data
export interface AuthEventData {
  type: AuthEventType;
  timestamp: number;
  user?: User;
  error?: string;
}

// Auth event listener
export type AuthEventListener = (event: AuthEventData) => void;

// API response format from backend
export interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Login response from API
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until expiration
}

// Register response from API
export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Token refresh response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
