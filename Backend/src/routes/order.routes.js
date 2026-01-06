import express from 'express';
import {
  createOrder,
  updateOrderStatus,
  markOrderAsPaid,
  cancelOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderStats
} from '../controllers/order.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, createOrder);
router.get('/', verifyJWT, isAdmin, getAllOrders);
router.get('/my-orders', verifyJWT, getMyOrders);
router.get('/stats', verifyJWT, isAdmin, getOrderStats);
router.patch('/:id/status', verifyJWT, isAdmin, updateOrderStatus);
router.patch('/:id/pay', verifyJWT, isAdmin, markOrderAsPaid);
router.patch('/:id/cancel', verifyJWT, cancelOrder);
router.get('/:id', verifyJWT, getOrderById);

export default router;
