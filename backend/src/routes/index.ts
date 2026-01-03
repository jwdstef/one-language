import { Router } from 'express';
import authRoutes from './auth.js';
import vocabularyRoutes from './vocabulary.js';
import statsRoutes from './stats.js';
import adminRoutes from './admin.js';
import reviewRoutes from './review.js';
import listsRoutes from './lists.js';
import achievementsRoutes from './achievements.js';
import goalsRoutes from './goals.js';
import subscriptionRoutes from './subscription.js';
import usageRoutes from './usage.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/stats', statsRoutes);
router.use('/admin', adminRoutes);
router.use('/review', reviewRoutes);
router.use('/lists', listsRoutes);
router.use('/achievements', achievementsRoutes);
router.use('/goals', goalsRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/usage', usageRoutes);

export default router;
