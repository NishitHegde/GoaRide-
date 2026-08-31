import express from 'express';
import {
  getExplorePlaces,
  getAllExplorePlacesAdmin,
  createExplorePlace,
  updateExplorePlace,
  deleteExplorePlace,
} from '../controllers/explorePlaceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getExplorePlaces)
  .post(protect, admin, createExplorePlace);

router.route('/admin')
  .get(protect, admin, getAllExplorePlacesAdmin);

router.route('/:id')
  .put(protect, admin, updateExplorePlace)
  .delete(protect, admin, deleteExplorePlace);

export default router;
