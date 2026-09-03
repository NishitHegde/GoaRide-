import crypto from 'crypto';
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

    // Calculate total live revenue from all active non-cancelled bookings
    const validBookings = await Booking.find({ 
      bookingStatus: { $nin: ['CANCELLED', 'CANCELED', 'REJECTED'] }
    });
    const revenue = validBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

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

// @desc Create a new Administrator account (Protected: Only existing verified admins)
// @route POST /api/admin/create-admin
export const createAdminAccount = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields for admin creation' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    const newAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'ADMIN',
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: `Admin account created for ${newAdmin.email}. Admin can now log in directly.`,
      _id: newAdmin._id,
      email: newAdmin.email,
      role: newAdmin.role,
      isVerified: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error creating admin account' });
  }
};
