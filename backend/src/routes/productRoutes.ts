import { Router } from 'express';
import { getAllProducts, getProductById, upsertProduct, deleteProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { validateProductInput } from '../middlewares/validateMiddleware.js';

const router = Router();

// Public / Customer Catalog Routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);

// Admin Management Routes
router.post('/admin/products', requireAdmin, validateProductInput, upsertProduct);
router.put('/admin/products/:id', requireAdmin, upsertProduct);
router.delete('/admin/products/:id', requireAdmin, deleteProduct);

export default router;
