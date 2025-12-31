import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/index.js';
import { sendVerificationCode, verifyCode } from '../services/email.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
});

const sendCodeSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// POST /api/auth/send-code - 发送验证码
router.post('/send-code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = sendCodeSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid email format',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    await sendVerificationCode(validation.data.email);
    sendSuccess(res, { message: 'Verification code sent' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    // 验证验证码
    const isValidCode = verifyCode(validation.data.email, validation.data.verificationCode);
    if (!isValidCode) {
      throw new AppError('INVALID_CODE', 'Invalid or expired verification code', 400);
    }

    const result = await authService.register({
      email: validation.data.email,
      password: validation.data.password,
      name: validation.data.name,
    });
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const result = await authService.login(validation.data);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = logoutSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    await authService.logout(validation.data.refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = refreshSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const tokens = await authService.refreshTokens(validation.data.refreshToken);
    sendSuccess(res, tokens);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const user = await authService.getCurrentUser(req.user.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    await authService.changePassword(
      req.user.userId,
      validation.data.currentPassword,
      validation.data.newPassword
    );
    
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
