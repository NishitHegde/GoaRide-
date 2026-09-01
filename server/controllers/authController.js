import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// @desc Register new user
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Security Hardening: Public registration is strictly restricted to 'USER' role
    // Public requests attempting to pass role='ADMIN' are ignored to prevent privilege escalation
    const unhashedToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'USER',
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: tokenExpires,
    });

    let emailSent = true;
    let emailErrorMsg = '';

    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: unhashedToken,
        role: user.role,
      });
    } catch (mailError) {
      emailSent = false;
      emailErrorMsg = mailError.message;
      console.warn(`⚠️ Registration succeeded but verification email delivery failed: ${mailError.message}`);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Registration successful! We've sent a verification link to your email address. Please check your inbox to activate your account."
        : "Account created successfully. However, we could not deliver the verification email right now. Please check your SMTP settings or click Resend Verification.",
      email: user.email,
      isVerified: false,
      emailSent,
      emailError: emailErrorMsg || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc Auth user & get token
// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Strict Email Verification Check
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email address before logging in.',
        isVerified: false,
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc Verify email using token from link
// @route GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const rawToken = req.params.token;

    if (!rawToken) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Find account matching hashed token
    const user = await User.findOne({ verificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid verification link. The link may have already been used or is malformed.',
      });
    }

    // Check expiration (30 mins limit)
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).json({
        message: 'This verification link has expired. Please request a new verification email.',
        isExpired: true,
        email: user.email,
      });
    }

    // Mark verified and invalidate single-use token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is now fully activated. You may now log in.',
      isVerified: true,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during email verification' });
  }
};

// @desc Resend verification email
// @route POST /api/auth/resend-verification
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Security measure: Do not leak whether an account exists, but handle cleanly
      return res.status(200).json({
        message: 'If an account with this email address exists, a verification link has been sent.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'This account is already verified. You can proceed directly to login.',
      });
    }

    // Generate new secure verification token and update expiration
    const unhashedToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(unhashedToken).digest('hex');

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await user.save();

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: unhashedToken,
      role: user.role,
    });

    res.json({
      success: true,
      message: `A new verification link has been sent to ${user.email}. Please check your inbox.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to resend verification email' });
  }
};

// @desc Get authenticated user profile
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User account not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching profile' });
  }
};

// @desc Logout user / clear session
// @route POST /api/auth/logout
export const logoutUser = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
