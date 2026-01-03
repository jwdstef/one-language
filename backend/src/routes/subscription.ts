/**
 * Subscription Routes
 * API endpoints for subscription status, features, and usage
 */

import { Router, Request, Response, NextFunction } from 'express';
import { subscriptionService, usageService, planService } from '../services/index.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

/**
 * GET /api/subscription/status
 * Get current user's subscription status
 * Requirements: 12.1
 */
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const status = await subscriptionService.getFullSubscriptionStatus(req.user.userId);
    sendSuccess(res, status);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/subscription/features
 * Get available features for current user's subscription
 * Requirements: 12.2
 */
router.get('/features', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const features = await subscriptionService.getUserFeatures(req.user.userId);
    sendSuccess(res, features);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/subscription/usage
 * Get usage statistics for current user
 * Requirements: 12.3
 */
router.get('/usage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const usage = await usageService.getAllUsage(req.user.userId);
    sendSuccess(res, usage);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/subscription/plans
 * Get all available subscription plans
 */
router.get('/plans', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await planService.getAllPlans();
    sendSuccess(res, plans);
  } catch (error) {
    next(error);
  }
});

export default router;
