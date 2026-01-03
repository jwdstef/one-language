/**
 * Vocabulary Lists Routes
 * API endpoints for managing custom vocabulary lists
 * Requirements: 9.4, 10.3
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as listService from '../services/list.service.js';
import * as subscriptionService from '../services/subscription.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// All list routes require authentication
router.use(authenticate);

/**
 * Middleware to check if user has access to vocabulary lists feature
 * Requirements: 10.3 - Free users cannot access vocabulary lists
 */
async function checkVocabularyListsAccess(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const features = await subscriptionService.getUserFeatures(req.user.userId);
    
    if (!features.vocabulary.lists) {
      throw new AppError(
        'FEATURE_NOT_AVAILABLE',
        'Vocabulary lists feature requires premium subscription. Upgrade to access custom word lists.',
        403,
        { feature: 'vocabularyLists', upgradeRequired: true }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

// Apply vocabulary lists access check to all routes
router.use(checkVocabularyListsAccess);

// Validation schemas
const createListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

const addWordSchema = z.object({
  wordId: z.string().uuid('Invalid word ID'),
});

// GET /api/lists - Get all lists for the user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const lists = await listService.getLists(req.user.userId);
    sendSuccess(res, lists);
  } catch (error) {
    next(error);
  }
});

// POST /api/lists - Create a new list
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = createListSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const list = await listService.createList(req.user.userId, validation.data);
    sendSuccess(res, list, 201);
  } catch (error) {
    next(error);
  }
});


// GET /api/lists/:id - Get a single list with its words
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const list = await listService.getListById(req.user.userId, req.params.id);
    sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
});

// PUT /api/lists/:id - Update a list
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = updateListSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const list = await listService.updateList(req.user.userId, req.params.id, validation.data);
    sendSuccess(res, list);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/lists/:id - Delete a list
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    await listService.deleteList(req.user.userId, req.params.id);
    sendSuccess(res, { message: 'List deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/lists/:id/words - Add a word to a list
router.post('/:id/words', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = addWordSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    await listService.addWordToList(req.user.userId, req.params.id, validation.data.wordId);
    sendSuccess(res, { message: 'Word added to list' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/lists/:id/words/:wordId - Remove a word from a list
router.delete('/:id/words/:wordId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    await listService.removeWordFromList(req.user.userId, req.params.id, req.params.wordId);
    sendSuccess(res, { message: 'Word removed from list' });
  } catch (error) {
    next(error);
  }
});

// GET /api/lists/word/:wordId - Get lists that contain a specific word
router.get('/word/:wordId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const lists = await listService.getListsForWord(req.user.userId, req.params.wordId);
    sendSuccess(res, lists);
  } catch (error) {
    next(error);
  }
});

export default router;
