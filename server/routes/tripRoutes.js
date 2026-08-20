import express from 'express';
import {
  planRoute,
  createTrip,
  getTripById,
  updateTripStatus,
  triggerSosAlert,
  getAllTripsAdmin,
} from '../controllers/tripController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/plan-route', planRoute);
router.post('/', protect, createTrip);
router.get('/admin/all', protect, admin, getAllTripsAdmin);
router.get('/:id', getTripById);
router.put('/:id/status', protect, updateTripStatus);
router.post('/:id/sos', protect, triggerSosAlert);

export default router;
