import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import * as reviewService from '../services/review.service.js';
import * as usageService from '../services/usage.service.js';

const router = Router();

// All review routes require authentication
router.use(authenticate);

// Validation schemas
const submitReviewSchema = z.object({
  known: z.boolean(),
});

/**
 * GET /api/review/due
 * Get words that are due for review, ordered by priority (spaced repetition).
 */
router.get('/due', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const words = await reviewService.getDueWords(req.user.userId, limit);

    sendPaginated(res, words, 1, limit, words.length);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/review/progress
 * Get review progress statistics for the current user.
 */
router.get('/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const progress = await reviewService.getReviewProgress(req.user.userId);

    sendSuccess(res, progress);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/review/limit
 * Check the current user's daily review limit status.
 * Requirements: 6.1, 6.2, 6.3
 */
router.get('/limit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const limitStatus = await usageService.checkLimit(req.user.userId, 'review');

    sendSuccess(res, limitStatus);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/review/features
 * Get review feature availability for the current user.
 * Requirements: 10.4 - Smart review recommendation gating
 */
router.get('/features', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Import subscription service dynamically to avoid circular dependency
    const subscriptionService = await import('../services/subscription.service.js');
    const features = await subscriptionService.getUserFeatures(req.user.userId);

    sendSuccess(res, {
      smartRecommend: features.review.smartRecommend,
      reviewPlan: features.review.reviewPlan,
      dailyLimit: features.review.dailyLimit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/review/:wordId
 * Submit a review result for a word.
 * Body: { known: boolean }
 * Requirements: 6.1, 6.2, 6.3 - Daily review limits
 */
router.post('/:wordId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = submitReviewSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input: known field must be a boolean',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    // Check daily review limit before allowing review (Requirements: 6.1, 6.2)
    const usageCheck = await usageService.checkLimit(req.user.userId, 'review');
    if (!usageCheck.allowed) {
      throw new AppError(
        'USAGE_LIMIT_EXCEEDED',
        `Daily review limit reached. You have reviewed ${usageCheck.current}/${usageCheck.limit} words today.`,
        403,
        {
          usageType: 'review',
          current: usageCheck.current,
          limit: usageCheck.limit,
          remaining: usageCheck.remaining,
        }
      );
    }

    const { wordId } = req.params;
    const result = await reviewService.submitReview(
      req.user.userId,
      wordId,
      validation.data.known
    );

    // Record usage after successful review (Requirements: 6.1)
    await usageService.recordUsage(req.user.userId, 'review', 1);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
