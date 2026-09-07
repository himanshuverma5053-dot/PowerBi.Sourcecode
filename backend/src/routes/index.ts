import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import aiRoutes from './aiRoutes.js';
import couponRoutes from './couponRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(productRoutes);
apiRouter.use(orderRoutes);
apiRouter.use(paymentRoutes);
apiRouter.use(aiRoutes);
apiRouter.use(couponRoutes);
apiRouter.use(analyticsRoutes);

export default apiRouter;
