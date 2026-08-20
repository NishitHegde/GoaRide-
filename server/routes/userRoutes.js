import express from 'express';
import { getUsers, getUserById, updateUserProfile, uploadProfileImage, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.post('/upload-avatar', protect, upload.single('avatarFile'), uploadProfileImage);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUserProfile);
router.delete('/:id', protect, admin, deleteUser);

export default router;
