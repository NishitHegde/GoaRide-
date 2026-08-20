import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';

// @desc Create a review for a vehicle
// @route POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { vehicleId, rating, comment, bookingId } = req.body;

    if (!vehicleId || !rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Verify user has completed a booking for this vehicle or allow review if user has any booking
    const userBooking = await Booking.findOne({
      user: req.user._id,
      vehicle: vehicleId,
    });

    if (!userBooking && req.user.role !== 'ADMIN') {
      return res.status(400).json({ message: 'You can only review vehicles you have booked.' });
    }

    const review = await Review.create({
      user: req.user._id,
      vehicle: vehicleId,
      booking: bookingId || (userBooking ? userBooking._id : null),
      rating: Number(rating),
      comment,
    });

    // Update Vehicle average rating and review count
    const vehicleReviews = await Review.find({ vehicle: vehicleId });
    const avgRating = (vehicleReviews.reduce((acc, item) => item.rating + acc, 0) / vehicleReviews.length).toFixed(1);

    await Vehicle.findByIdAndUpdate(vehicleId, {
      rating: Number(avgRating),
      reviewCount: vehicleReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name profileImage');
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get reviews for a vehicle
// @route GET /api/reviews/:vehicleId
export const getVehicleReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete review (Admin or author)
// @route DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
