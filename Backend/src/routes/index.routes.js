import express from 'express';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import subCategoryRoutes from './subCategory.routes.js';
import brandRoutes from './brand.routes.js';
import reviewRoutes from './review.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import couponRoutes from './coupon.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();

// Auth
router.use('/auth', authRoutes);

// Core resources
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subCategoryRoutes);
router.use('/brands', brandRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/users', userRoutes);

export default router;
