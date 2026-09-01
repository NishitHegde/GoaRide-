import crypto from 'crypto';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';

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

    const unhashedToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const newAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'ADMIN',
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: tokenExpires,
    });

    let emailSent = true;
    try {
      await sendVerificationEmail({
        email: newAdmin.email,
        name: newAdmin.name,
        token: unhashedToken,
        role: 'ADMIN',
      });
    } catch (mailErr) {
      emailSent = false;
      console.warn(`⚠️ Admin account created but email sending failed: ${mailErr.message}`);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? `Admin account created for ${newAdmin.email}. A real verification email has been sent.`
        : `Admin account created for ${newAdmin.email}, but email sending failed. Check SMTP credentials.`,
      _id: newAdmin._id,
      email: newAdmin.email,
      role: newAdmin.role,
      isVerified: false,
      emailSent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error creating admin account' });
  }
};
