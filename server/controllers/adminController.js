import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// @desc Get admin dashboard overview stats
// @route GET /api/admin/dashboard
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalVehicles = await Vehicle.countDocuments({});
    const totalBookings = await Booking.countDocuments({});
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'PENDING' });
    const activeBookings = await Booking.countDocuments({ bookingStatus: { $in: ['CONFIRMED', 'ACTIVE'] } });
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'COMPLETED' });

    // Calculate total revenue excluding CANCELLED bookings
    const validPaidBookings = await Booking.find({ 
      paymentStatus: 'PAID',
      bookingStatus: { $nin: ['CANCELLED', 'CANCELED'] }
    });
    const revenue = validPaidBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    const recentBookings = await Booking.find({})
      .populate('vehicle')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalVehicles,
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      revenue,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
