import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Favorite from '../models/Favorite.js';
import Review from '../models/Review.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'goaride_jwt_secret_key_2026_super_secure', {
    expiresIn: '30d',
  });
};

// @desc Get all users (Admin only)
// @route GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user by ID (Admin or owner)
// @route GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/users/:id
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only user themselves or Admin can update
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    if (req.body.profileImage !== undefined && req.body.profileImage !== '') {
      user.profileImage = req.body.profileImage;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.user.role === 'ADMIN' && req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Upload profile image via Multer
// @route POST /api/users/upload-avatar
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    if (user) {
      user.profileImage = imageUrl;
      const updatedUser = await user.save();
      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete user (Admin only)
// @route DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own active admin account.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up dependent records in Booking, Favorite, and Review
    await Booking.deleteMany({ user: userId });
    await Favorite.deleteMany({ user: userId });
    await Review.deleteMany({ user: userId });

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User account and associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
