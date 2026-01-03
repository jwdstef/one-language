/**
 * Usage Routes
 * API endpoints for recording and checking usage limits
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { usageService } from '../services/index.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';
import type { UsageType } from '../services/usage.service.js';

const router = Router();

// All usage routes require authentication
router.use(authenticate);

// Validation schemas
const recordUsageSchema = z.object({
  type: z.enum(['translation', 'review', 'collection', 'website_rule']),
  count: z.number().int().positive().optional().default(1),
});

const usageTypeSchema = z.enum(['translation', 'review', 'collection', 'website_rule']);

/**
 * POST /api/usage/record
 * Record usage for a specific type
 * Requirements: 3.1, 4.1, 6.1
 */
router.post('/record', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = recordUsageSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const { type, count } = validation.data;

    // Check if user can perform this action before recording
    const limitCheck = await usageService.checkLimit(req.user.userId, type as UsageType);
    
    if (!limitCheck.allowed) {
      throw new AppError(
        'USAGE_LIMIT_EXCEEDED',
        `You have reached your ${type} limit`,
        403,
        {
          type,
          current: limitCheck.current,
          limit: limitCheck.limit,
          remaining: limitCheck.remaining,
        }
      );
    }

    // Record the usage and return updated status
    const result = await usageService.recordAndCheck(req.user.userId, type as UsageType, count);
    
    sendSuccess(res, {
      recorded: true,
      usage: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/usage/check/:type
 * Check usage limit for a specific type
 * Requirements: 3.1, 4.1, 6.1
 */
router.get('/check/:type', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const typeValidation = usageTypeSchema.safeParse(req.params.type);
    if (!typeValidation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid usage type. Must be one of: translation, review, collection, website_rule',
        400
      );
    }

    const type = typeValidation.data as UsageType;
    const result = await usageService.checkLimit(req.user.userId, type);
    
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/usage/today/:type
 * Get today's usage count for a specific type
 */
router.get('/today/:type', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const typeValidation = usageTypeSchema.safeParse(req.params.type);
    if (!typeValidation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid usage type. Must be one of: translation, review, collection, website_rule',
        400
      );
    }

    const type = typeValidation.data as UsageType;
    const count = await usageService.getTodayUsage(req.user.userId, type);
    
    sendSuccess(res, { type, count, date: new Date().toISOString().split('T')[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
