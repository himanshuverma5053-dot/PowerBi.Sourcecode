import { Router } from 'express';
import { getAllCoupons, validateCoupon } from '../controllers/couponController.js';

const router = Router();

router.get('/coupons', getAllCoupons);
router.post('/coupons/validate', validateCoupon);

export default router;
