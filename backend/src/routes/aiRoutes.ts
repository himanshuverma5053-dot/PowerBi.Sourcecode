import { Router } from 'express';
import { getTyreAdvice } from '../controllers/aiAdvisorController.js';

const router = Router();

router.post('/ai/tyre-advisor', getTyreAdvice);

export default router;
