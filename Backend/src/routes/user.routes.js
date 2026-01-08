import express from 'express';
import {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  getUserStats
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/stats', verifyJWT, isAdmin, getUserStats);
router.get('/', verifyJWT, isAdmin, getAllUsers);
router.get('/:id', verifyJWT, isAdmin, getUserById);
router.patch('/:id/status', verifyJWT, isAdmin, toggleUserStatus);
router.delete('/:id', verifyJWT, isAdmin, deleteUser);

export default router;
