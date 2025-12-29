import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import type { JwtPayload, AuthTokens } from '../types/index.js';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  subscriptionTier: string;
  role: string;
  createdAt: Date;
}

function generateTokens(payload: JwtPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export async function register(
  input: RegisterInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('AUTH_EMAIL_EXISTS', 'Email already registered', 400);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
  });

  // Create user streak record
  await prisma.userStreak.create({
    data: {
      userId: user.id,
    },
  });

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokens(payload);

  // Store refresh token
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN));
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      role: user.role,
      createdAt: user.createdAt,
    },
    tokens,
  };
}

export async function login(
  input: LoginInput
): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  // Check if user is disabled
  if (user.status !== 'active') {
    throw new AppError('AUTH_USER_DISABLED', 'Account has been disabled', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  const tokens = generateTokens(payload);

  // Store refresh token
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN));
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      subscriptionTier: user.subscriptionTier,
      role: user.role,
      createdAt: user.createdAt,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  // Delete the refresh token
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  // Find the refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError('AUTH_INVALID_TOKEN', 'Invalid refresh token', 401);
  }

  // Check if token is expired
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('AUTH_TOKEN_EXPIRED', 'Refresh token has expired', 401);
  }

  // Check if user is still active
  if (storedToken.user.status !== 'active') {
    throw new AppError('AUTH_USER_DISABLED', 'Account has been disabled', 401);
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Generate new tokens
  const payload: JwtPayload = {
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  };
  const tokens = generateTokens(payload);

  // Store new refresh token
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN));
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: storedToken.user.id,
      expiresAt,
    },
  });

  return tokens;
}

export async function getCurrentUser(userId: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    subscriptionTier: user.subscriptionTier,
    role: user.role,
    createdAt: user.createdAt,
  };
}
