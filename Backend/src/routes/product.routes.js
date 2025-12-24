import express from 'express';
import { createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = express.Router();

// Create product (Admin)
router.post(
  '/',
  verifyJWT,
  isAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  createProduct
);

// Update product (Admin)
router.patch(
  '/:id',
  verifyJWT,
  isAdmin,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  updateProduct
);

// Delete product (Admin)
router.delete('/:id', verifyJWT, isAdmin, deleteProduct);

export default router;