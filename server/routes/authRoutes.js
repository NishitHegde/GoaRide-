import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  getMe,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
