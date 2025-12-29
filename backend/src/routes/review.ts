import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import * as reviewService from '../services/review.service.js';

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
 * POST /api/review/:wordId
 * Submit a review result for a word.
 * Body: { known: boolean }
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

    const { wordId } = req.params;
    const result = await reviewService.submitReview(
      req.user.userId,
      wordId,
      validation.data.known
    );

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
