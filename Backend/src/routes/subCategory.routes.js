import express from 'express';
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getSubCategoryById
} from '../controllers/subCategory.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/', getAllSubCategories);
router.get('/:identifier', getSubCategoryById);
router.post('/', verifyJWT, isAdmin, createSubCategory);
router.patch('/:id', verifyJWT, isAdmin, updateSubCategory);
router.delete('/:id', verifyJWT, isAdmin, deleteSubCategory);

export default router;
