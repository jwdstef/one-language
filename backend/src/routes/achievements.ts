import { Router, Request, Response, NextFunction } from 'express';
import { achievementService } from '../services/index.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/achievements - 获取用户成就
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const achievements = await achievementService.getUserAchievements(req.user.userId);
    sendSuccess(res, achievements);
  } catch (error) {
    next(error);
  }
});

// POST /api/achievements/check - 检查并解锁成就
router.post('/check', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const newlyUnlocked = await achievementService.checkAndUnlockAchievements(req.user.userId);
    sendSuccess(res, { newlyUnlocked });
  } catch (error) {
    next(error);
  }
});

// GET /api/achievements/level - 获取用户等级
router.get('/level', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const { prisma } = await import('../lib/prisma.js');
    const totalWords = await prisma.favoriteWord.count({
      where: { userId: req.user.userId },
    });

    const level = achievementService.getUserLevel(totalWords);
    sendSuccess(res, { ...level, totalWords });
  } catch (error) {
    next(error);
  }
});

export default router;
