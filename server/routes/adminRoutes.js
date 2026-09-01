import express from 'express';
import { getAdminStats, createAdminAccount } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getAdminStats);
router.post('/create-admin', protect, admin, createAdminAccount);

export default router;
