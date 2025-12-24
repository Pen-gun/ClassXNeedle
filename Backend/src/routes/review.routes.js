import express from 'express';
import { createReview, updateReview, deleteReview } from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, createReview);
router.patch('/:id', verifyJWT, updateReview);
router.delete('/:id', verifyJWT, deleteReview);

export default router;