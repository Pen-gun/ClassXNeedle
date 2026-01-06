import express from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.patch('/change-password', verifyJWT, changePassword);
router.get('/me', verifyJWT, getCurrentUser);

export default router;
