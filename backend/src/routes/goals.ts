import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { goalService } from '../services/index.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

const updateGoalSchema = z.object({
  dailyWordGoal: z.number().min(1).max(100).optional(),
  dailyReviewGoal: z.number().min(1).max(200).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().nullable().optional(),
});

// GET /api/goals - 获取用户目标设置
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const goal = await goalService.getUserGoal(req.user.userId);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
});

// PUT /api/goals - 更新用户目标
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = updateGoalSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError('VALIDATION_ERROR', 'Invalid input', 400, validation.error.flatten().fieldErrors);
    }

    const goal = await goalService.updateUserGoal(req.user.userId, validation.data);
    sendSuccess(res, goal);
  } catch (error) {
    next(error);
  }
});

// GET /api/goals/progress - 获取今日进度
router.get('/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const progress = await goalService.getDailyProgress(req.user.userId);
    sendSuccess(res, progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/goals/today - 获取今日统计
router.get('/today', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const todayStats = await goalService.getTodayStats(req.user.userId);
    sendSuccess(res, todayStats);
  } catch (error) {
    next(error);
  }
});

export default router;
