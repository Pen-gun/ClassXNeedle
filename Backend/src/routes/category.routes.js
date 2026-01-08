import express from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoryStats
} from '../controllers/category.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.get('/stats', verifyJWT, isAdmin, getCategoryStats);
router.get('/', getAllCategories);
router.get('/:identifier', getCategoryById);
router.post('/', verifyJWT, isAdmin, upload.single('image'), createCategory);
router.patch('/:id', verifyJWT, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyJWT, isAdmin, deleteCategory);

export default router;
