import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// Initialize Razorpay instance if keys are present
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc Create Razorpay payment order or dev fallback order
// @route POST /api/payments/create-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // If Razorpay keys are configured, create real Razorpay Order
    if (razorpay) {
      const options = {
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        isDevMode: false,
      });
    }

    // Development Fallback Payment Order
    const devOrderId = `order_dev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    res.json({
      success: true,
      orderId: devOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      keyId: 'rzp_test_dev_mode',
      isDevMode: true,
      message: 'Razorpay Dev Mode active. Automatic instant verification available.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify payment signature / success
// @route POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, amount, isDevMode } = req.body;

    // Dev mode auto-success
    if (isDevMode || !razorpay) {
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
        });

        await Payment.create({
          booking: bookingId,
          user: req.user._id,
          amount: amount || 0,
          paymentId: razorpay_payment_id || `pay_dev_${Date.now()}`,
          orderId: razorpay_order_id || `order_dev_${Date.now()}`,
          status: 'SUCCESS',
        });
      }

      return res.json({ success: true, message: 'Dev Mode payment verified successfully' });
    }

    // Real Razorpay Signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
        });

        await Payment.create({
          booking: bookingId,
          user: req.user._id,
          amount: amount || 0,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
          status: 'SUCCESS',
        });
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
