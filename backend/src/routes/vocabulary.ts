import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { vocabularyService, exportService, usageService, subscriptionService } from '../services/index.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError, authenticate } from '../middleware/index.js';

const router = Router();

// All vocabulary routes require authentication
router.use(authenticate);

// Validation schemas
const addWordSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100),
  originalText: z.string().max(100).optional(),
  pronunciation: z
    .object({
      phonetic: z.string(),
      audioUrl: z.string().optional(),
      ukPhonetic: z.string().optional(),
      usPhonetic: z.string().optional(),
    })
    .optional(),
  meanings: z
    .array(
      z.object({
        partOfSpeech: z.string(),
        definition: z.string(),
        examples: z.array(z.string()).optional(),
      })
    )
    .optional(),
  exampleSentences: z
    .array(
      z.object({
        sentence: z.string(),
        translation: z.string(),
        source: z.string().optional(),
      })
    )
    .optional(),
  sourceUrl: z.string().url().optional(),
  context: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const updateTagsSchema = z.object({
  tags: z.array(z.string().max(50)).max(20),
});

const syncSchema = z.object({
  words: z.array(addWordSchema),
  lastSyncAt: z.string().datetime().optional(),
});

const listQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  domain: z.string().optional(),
  masteryLevel: z.enum(['new', 'learning', 'familiar', 'mastered']).optional(),
  sortBy: z.enum(['favoritedAt', 'word', 'reviewCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/vocabulary
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = listQuerySchema.safeParse(req.query);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid query parameters',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const params = {
      ...validation.data,
      tags: validation.data.tags?.split(',').filter(Boolean),
      domain: validation.data.domain,
    };

    const { words, total } = await vocabularyService.getVocabulary(req.user.userId, params);

    sendPaginated(res, words, params.page || 1, params.pageSize || 20, total);
  } catch (error) {
    next(error);
  }
});

// POST /api/vocabulary
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Vocabulary] POST request body:', JSON.stringify(req.body, null, 2));
    console.log('[Vocabulary] User:', req.user);
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = addWordSchema.safeParse(req.body);
    if (!validation.success) {
      console.log('[Vocabulary] Validation failed:', validation.error.flatten());
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    // Check collection limit before adding word (Requirements: 4.1, 4.2)
    const usageLimit = await usageService.checkLimit(req.user.userId, 'collection');
    if (!usageLimit.allowed) {
      throw new AppError(
        'USAGE_LIMIT_EXCEEDED',
        `Vocabulary collection limit reached. You have ${usageLimit.current}/${usageLimit.limit} words. Upgrade to premium for unlimited collections.`,
        403,
        {
          type: 'collection',
          current: usageLimit.current,
          limit: usageLimit.limit,
          remaining: usageLimit.remaining,
        }
      );
    }

    console.log('[Vocabulary] Validation passed, adding word...');
    const word = await vocabularyService.addWord(req.user.userId, validation.data);
    console.log('[Vocabulary] Word added successfully:', word.id);
    sendSuccess(res, word, 201);
  } catch (error) {
    console.log('[Vocabulary] Error:', error);
    next(error);
  }
});

// GET /api/vocabulary/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const word = await vocabularyService.getWordById(req.user.userId, req.params.id);
    sendSuccess(res, word);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vocabulary/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    await vocabularyService.deleteWord(req.user.userId, req.params.id);
    sendSuccess(res, { message: 'Word deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vocabulary/:id/tags
router.put('/:id/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    // Check if user has access to advanced tags feature (Requirements: 10.3)
    const features = await subscriptionService.getUserFeatures(req.user.userId);
    if (!features.vocabulary.tags) {
      throw new AppError(
        'FEATURE_NOT_AVAILABLE',
        'Advanced tags feature requires premium subscription. Upgrade to organize your vocabulary with custom tags.',
        403,
        { feature: 'tags', upgradeRequired: true }
      );
    }

    const validation = updateTagsSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const word = await vocabularyService.updateTags(
      req.user.userId,
      req.params.id,
      validation.data.tags
    );
    sendSuccess(res, word);
  } catch (error) {
    next(error);
  }
});

// POST /api/vocabulary/sync
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const validation = syncSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid input',
        400,
        validation.error.flatten().fieldErrors
      );
    }

    const result = await vocabularyService.syncWords(req.user.userId, validation.data);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// GET /api/vocabulary/export
router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const format = (req.query.format as string) || 'json';
    if (format !== 'csv' && format !== 'json') {
      throw new AppError('VALIDATION_ERROR', 'Format must be csv or json', 400);
    }

    const { content, contentType, filename } = await exportService.exportVocabulary(
      req.user.userId,
      format
    );

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    next(error);
  }
});

// POST /api/vocabulary/generate-sentence - 生成包含单词的优美句子
router.post('/generate-sentence', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
    }

    const { word, meaning } = req.body;
    if (!word) {
      throw new AppError('VALIDATION_ERROR', 'Word is required', 400);
    }

    const result = await vocabularyService.generateBeautifulSentence(word, meaning);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
