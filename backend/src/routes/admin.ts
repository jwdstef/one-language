import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as adminService from '../services/admin.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import type { UserStatus } from '../types/index.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/users - List all users with pagination and search
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      pageSize = '20',
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const result = await adminService.getUsers({
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      search: search as string | undefined,
      status: status as UserStatus | undefined,
      sortBy: sortBy as 'createdAt' | 'lastLoginAt' | 'name' | 'email',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    sendPaginated(
      res,
      result.users,
      parseInt(page as string, 10),
      parseInt(pageSize as string, 10),
      result.total
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});


// PUT /api/admin/users/:id/status - Update user status (enable/disable)
router.put('/users/:id/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses: UserStatus[] = ['active', 'suspended', 'deleted'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status must be one of: active, suspended, deleted',
        },
      });
      return;
    }

    const user = await adminService.updateUserStatus(id, status);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stats/platform - Get platform-wide statistics
router.get('/stats/platform', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getPlatformStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/stats/vocabulary - Get vocabulary statistics
router.get('/stats/vocabulary', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getVocabularyStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/vocabulary - List all vocabulary (across all users)
router.get('/vocabulary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      pageSize = '20',
      search,
      tag,
      masteryLevel,
      userId,
      sortBy = 'favoritedAt',
      sortOrder = 'desc',
    } = req.query;

    const result = await adminService.getAllVocabulary({
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      search: search as string | undefined,
      tag: tag as string | undefined,
      masteryLevel: masteryLevel as string | undefined,
      userId: userId as string | undefined,
      sortBy: sortBy as 'favoritedAt' | 'word' | 'reviewCount',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    sendPaginated(
      res,
      result.words,
      parseInt(page as string, 10),
      parseInt(pageSize as string, 10),
      result.total
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/vocabulary/:id - Get word details
router.get('/vocabulary/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const word = await adminService.getWordById(req.params.id);
    sendSuccess(res, word);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/vocabulary/:id - Delete a word
router.delete('/vocabulary/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteWord(req.params.id);
    sendSuccess(res, { message: 'Word deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/vocabulary/:id/tags - Update word tags
router.put('/vocabulary/:id/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TAGS',
          message: 'Tags must be an array',
        },
      });
      return;
    }
    const word = await adminService.updateWordTags(req.params.id, tags);
    sendSuccess(res, word);
  } catch (error) {
    next(error);
  }
});

export default router;
