import express from 'express';
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAllCoupons,
  getCouponById,
  getCouponStats,
  getActiveCoupons
} from '../controllers/coupon.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/active', getActiveCoupons);
router.get('/stats', verifyJWT, isAdmin, getCouponStats);
router.get('/', verifyJWT, isAdmin, getAllCoupons);
router.get('/:identifier', verifyJWT, isAdmin, getCouponById);
router.post('/', verifyJWT, isAdmin, createCoupon);
router.patch('/:id', verifyJWT, isAdmin, updateCoupon);
router.delete('/:id', verifyJWT, isAdmin, deleteCoupon);
router.post('/validate', validateCoupon);

export default router;
