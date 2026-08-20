import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/', protect, admin, upload.single('imageFile'), createVehicle);
router.put('/:id', protect, admin, upload.single('imageFile'), updateVehicle);
router.delete('/:id', protect, admin, deleteVehicle);

export default router;
