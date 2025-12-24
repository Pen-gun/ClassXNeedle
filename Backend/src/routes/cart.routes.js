import express from 'express';
import { addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } from '../controllers/cart.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/items', verifyJWT, addToCart);
router.patch('/items/:productId', verifyJWT, updateCartItem);
router.delete('/items/:productId', verifyJWT, removeFromCart);
router.delete('/', verifyJWT, clearCart);
router.post('/coupon', verifyJWT, applyCoupon);
router.delete('/coupon', verifyJWT, removeCoupon);

export default router;