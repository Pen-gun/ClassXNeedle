import express from 'express';
import { createBrand, updateBrand, deleteBrand } from '../controllers/brand.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, isAdmin, upload.single('image'), createBrand);
router.patch('/:id', verifyJWT, isAdmin, upload.single('image'), updateBrand);
router.delete('/:id', verifyJWT, isAdmin, deleteBrand);

export default router;