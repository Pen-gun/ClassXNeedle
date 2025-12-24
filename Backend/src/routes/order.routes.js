import express from 'express';
import { createOrder, updateOrderStatus, markOrderAsPaid, cancelOrder } from '../controllers/order.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, createOrder);
router.patch('/:id/status', verifyJWT, isAdmin, updateOrderStatus);
router.patch('/:id/pay', verifyJWT, isAdmin, markOrderAsPaid);
router.patch('/:id/cancel', verifyJWT, cancelOrder);

export default router;