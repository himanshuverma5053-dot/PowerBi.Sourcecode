import { Router } from 'express';
import { getAllOrders, createOrder, trackOrders, updateOrderStatus } from '../controllers/orderController.js';
import { restrictAdminOrderCreation, requireAdmin } from '../middlewares/authMiddleware.js';
import { validateOrderInput } from '../middlewares/validateMiddleware.js';

const router = Router();

// Order List & Tracking
router.get('/orders', getAllOrders);
router.get('/orders/track/:query', trackOrders);

// Order Placement (Customer Portal only)
router.post('/orders', restrictAdminOrderCreation, validateOrderInput, createOrder);

// Admin Status Updates
router.post('/admin/orders/status', requireAdmin, updateOrderStatus);

export default router;
