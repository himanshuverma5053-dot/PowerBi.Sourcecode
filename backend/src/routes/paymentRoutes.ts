import { Router } from 'express';
import { getAllPayments, processPayment } from '../controllers/paymentController.js';
import { restrictAdminOrderCreation } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/payments', getAllPayments);
router.post('/payments/process', restrictAdminOrderCreation, processPayment);

export default router;
