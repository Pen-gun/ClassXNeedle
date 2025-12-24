import express from 'express';
import { createCoupon, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/coupon.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, isAdmin, createCoupon);
router.patch('/:id', verifyJWT, isAdmin, updateCoupon);
router.delete('/:id', verifyJWT, isAdmin, deleteCoupon);
router.post('/validate', validateCoupon);

export default router;