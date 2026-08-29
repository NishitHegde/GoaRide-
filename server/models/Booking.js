import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropLocation: {
      type: String,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    pickupTime: {
      type: String,
      default: '10:00 AM',
    },
    returnDate: {
      type: Date,
      required: true,
    },
    returnTime: {
      type: String,
      default: '10:00 AM',
    },
    duration: {
      type: Number, // Number of days
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'UNPAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    trackingId: {
      type: String,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
