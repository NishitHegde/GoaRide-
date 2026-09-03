import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendOtpEmail, maskEmail } from '../utils/sendEmail.js';

// Helper to validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// @desc Register new user & send 6-digit OTP
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
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    // Cryptographically secure 6-digit OTP generation
    const plainOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(plainOtp).digest('hex');
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Create pending user record (role strictly forced to 'USER')
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'USER',
      isVerified: false,
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    });

    // ATTEMPT REAL EMAIL DELIVERY
    try {
      await sendOtpEmail({
        email: user.email,
        name: user.name,
        otp: plainOtp,
      });
    } catch (mailError) {
      // DO NOT SAY SUCCESS IF EMAIL FAILED!
      // Roll back user creation so account is not left in an unusable state
      await User.findByIdAndDelete(user._id);
      console.error(`[Auth Controller Error] Registration rolled back because OTP email delivery failed: ${mailError.message}`);

      return res.status(500).json({
        message: 'Unable to send verification email. Please try again later or verify email configuration.',
        error: mailError.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "We've sent a 6-digit verification code to your email.",
      email: user.email,
      maskedEmail: maskEmail(user.email),
      isVerified: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc Verify 6-digit OTP
// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and 6-digit verification code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ message: 'Verification code must be exactly 6 digits' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. You can log in directly.' });
    }

    // Check maximum attempts (Max 5 attempts)
    if (user.otpAttempts >= 5) {
      return res.status(400).json({
        message: 'Maximum verification attempts exceeded. Please click Resend OTP to request a new code.',
        maxAttemptsExceeded: true,
      });
    }

    // Check OTP Expiration (5 mins limit)
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        message: 'This verification code has expired. Please request a new code.',
        isExpired: true,
      });
    }

    // Compare SHA-256 Hashed OTP
    const incomingOtpHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    if (incomingOtpHash !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();

      const remainingAttempts = 5 - user.otpAttempts;
      return res.status(400).json({
        message: remainingAttempts > 0
          ? `Invalid verification code. Please try again (${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} left).`
          : 'Invalid verification code. Maximum attempts reached. Please request a new code.',
        remainingAttempts,
      });
    }

    // OTP Verified Successfully! Clear OTP fields and activate user
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLastSentAt = undefined;

    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to GoaRide.',
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during OTP verification' });
  }
};

// @desc Resend 6-digit OTP
// @route POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
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
      return res.status(200).json({
        message: 'If an account exists with this email address, a new verification code has been sent.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. You can log in.' });
    }

    // Resend Rate Limiting (60 Seconds cooldown)
    if (user.otpLastSentAt) {
      const timeElapsed = Date.now() - new Date(user.otpLastSentAt).getTime();
      if (timeElapsed < 60 * 1000) {
        const remainingSecs = Math.ceil((60 * 1000 - timeElapsed) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSecs} second${remainingSecs > 1 ? 's' : ''} before requesting a new code.`,
          remainingSecs,
        });
      }
    }

    // Generate fresh cryptographically secure 6-digit OTP
    const plainOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = crypto.createHash('sha256').update(plainOtp).digest('hex');

    // ATTEMPT EMAIL DELIVERY FIRST
    try {
      await sendOtpEmail({
        email: user.email,
        name: user.name,
        otp: plainOtp,
      });
    } catch (mailError) {
      console.error(`[Auth Controller Error] Resend OTP email delivery failed: ${mailError.message}`);
      return res.status(500).json({
        message: 'Unable to send verification email. Please try again later.',
        error: mailError.message,
      });
    }

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${maskEmail(user.email)}.`,
      maskedEmail: maskEmail(user.email),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to resend verification code' });
  }
};

// @desc Auth user & get token (UNTOUCHED FOR ADMIN)
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

    // ADMIN LOGIN IS COMPLETELY UNTOUCHED AND UNCHANGED!
    // ADMINS LOG IN DIRECTLY WITH EMAIL & PASSWORD WITHOUT OTP/VERIFICATION
    const isAdmin = user.role?.toUpperCase() === 'ADMIN';

    if (!isAdmin && !user.isVerified) {
      // Trigger new OTP send if last sent > 60s ago
      let sendNewOtp = true;
      if (user.otpLastSentAt && (Date.now() - new Date(user.otpLastSentAt).getTime() < 60 * 1000)) {
        sendNewOtp = false;
      }

      if (sendNewOtp) {
        const plainOtp = crypto.randomInt(100000, 999999).toString();
        const newOtpHash = crypto.createHash('sha256').update(plainOtp).digest('hex');

        try {
          await sendOtpEmail({ email: user.email, name: user.name, otp: plainOtp });
          user.otpHash = newOtpHash;
          user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
          user.otpAttempts = 0;
          user.otpLastSentAt = new Date();
          await user.save();
        } catch (mailErr) {
          console.error(`[Auth Controller Error] Login OTP resend failed: ${mailErr.message}`);
        }
      }

      return res.status(401).json({
        message: 'Please verify your email address first.',
        isVerified: false,
        email: user.email,
        maskedEmail: maskEmail(user.email),
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
      isVerified: user.isVerified || isAdmin,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// Legacy link verification endpoint compatibility
export const verifyEmail = verifyOtp;
export const resendVerificationEmail = resendOtp;

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
