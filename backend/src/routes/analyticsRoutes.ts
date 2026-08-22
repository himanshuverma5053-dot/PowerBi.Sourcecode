import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/analyticsController.js';

const router = Router();

router.get('/analytics/dashboard', getDashboardMetrics);

export default router;
