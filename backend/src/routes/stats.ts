import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { statsService } from '../services/index.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// All stats routes require authentication
router.use(authenticate);

// Validation schemas
const dailyQuerySchema = z.object({
  days: z.string().transform(Number).optional(),
});

// GET /api/stats/overview
router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const overview = await statsService.getOverview(req.user.userId);
    sendSuccess(res, overview);
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/daily
router.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = dailyQuerySchema.safeParse(req.query);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid query parameters',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const days = validation.data.days || 30;
    const stats = await statsService.getDailyStats(req.user.userId, days);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/weekly
router.get('/weekly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const stats = await statsService.getDailyStats(req.user.userId, 7);
    sendSuccess(res, { dailyActivity: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/monthly
router.get('/monthly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const stats = await statsService.getDailyStats(req.user.userId, 30);
    sendSuccess(res, { dailyActivity: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/streak
router.get('/streak', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const streakInfo = await statsService.getStreakInfo(req.user.userId);
    sendSuccess(res, streakInfo);
  } catch (error) {
    next(error);
  }
});

export default router;
