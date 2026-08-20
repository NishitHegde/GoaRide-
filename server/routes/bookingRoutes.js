import express from 'express';
import {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  trackBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/track/:query', trackBooking);
router.get('/', protect, admin, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

export default router;
