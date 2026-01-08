import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getReviewById,
  getReviewStats
} from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/stats', getReviewStats);
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.post('/', verifyJWT, createReview);
router.patch('/:id', verifyJWT, updateReview);
router.delete('/:id', verifyJWT, deleteReview);

export default router;
