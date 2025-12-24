import express from 'express';
import { createSubCategory, updateSubCategory, deleteSubCategory } from '../controllers/subCategory.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, isAdmin, createSubCategory);
router.patch('/:id', verifyJWT, isAdmin, updateSubCategory);
router.delete('/:id', verifyJWT, isAdmin, deleteSubCategory);

export default router;