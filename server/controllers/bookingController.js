import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';

// Helper to generate booking number
const generateBookingNumber = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `GR-${year}-${randomNum}`;
};

// @desc Create new booking with strict server availability validation & price calculation
// @route POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { vehicleId, pickupLocation, dropLocation, pickupDate, pickupTime, returnDate, returnTime, notes } = req.body;

    if (!vehicleId || !pickupDate || !returnDate || !pickupLocation) {
      return res.status(400).json({ message: 'Please provide vehicle, pickup location, pickup date, and return date' });
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid dates provided' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'Return date must be after pickup date' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: 'This vehicle is currently under maintenance or unlisted' });
    }

    // STRICT OVERLAPPING BOOKING CHECK ON SERVER
    const overlappingBookings = await Booking.find({
      vehicle: vehicleId,
      bookingStatus: { $in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      $or: [
        { pickupDate: { $lte: end }, returnDate: { $gte: start } },
      ],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        message: 'Vehicle is unavailable for the selected dates. Please choose different dates or another vehicle.',
      });
    }

    // SERVER-SIDE RE-CALCULATION OF PRICE
    const durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const basePrice = durationDays * vehicle.pricePerDay;
    const securityDeposit = vehicle.securityDeposit || 1000;
    const taxes = Math.round(basePrice * 0.18); // 18% GST standard calculation
    const discount = durationDays >= 7 ? Math.round(basePrice * 0.1) : 0; // 10% discount for weekly rentals
    const totalAmount = basePrice + securityDeposit + taxes - discount;

    const bookingNumber = generateBookingNumber();
    const trackingId = `GR-TRACK-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = new Booking({
      bookingNumber,
      user: req.user._id,
      vehicle: vehicle._id,
      pickupLocation,
      dropLocation: dropLocation || pickupLocation,
      pickupDate: start,
      pickupTime: pickupTime || '10:00 AM',
      returnDate: end,
      returnTime: returnTime || '10:00 AM',
      duration: durationDays,
      basePrice,
      securityDeposit,
      taxes,
      discount,
      totalAmount,
      paymentStatus: 'UNPAID',
      bookingStatus: 'PENDING',
      trackingId,
      notes: notes || '',
    });

    const createdBooking = await booking.save();
    const populatedBooking = await Booking.findById(createdBooking._id).populate('vehicle').populate('user', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged-in user's bookings
// @route GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all bookings (Admin only)
// @route GET /api/bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('vehicle')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get booking by ID
// @route GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // User can only view their own booking unless admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Track booking by bookingNumber or trackingId
// @route GET /api/bookings/track/:query
export const trackBooking = async (req, res) => {
  try {
    const queryStr = req.params.query.trim();
    const booking = await Booking.findOne({
      $or: [
        { bookingNumber: queryStr },
        { trackingId: queryStr },
      ],
    }).populate('vehicle');

    if (!booking) {
      return res.status(404).json({ message: 'Booking or Tracking ID not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update booking status (Admin only or user cancel)
// @route PUT /api/bookings/:id
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.body.bookingStatus) {
      booking.bookingStatus = req.body.bookingStatus;
    }

    if (req.body.paymentStatus) {
      booking.paymentStatus = req.body.paymentStatus;
    }

    const updated = await booking.save();
    const populated = await Booking.findById(updated._id).populate('vehicle').populate('user', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel or Permanently Delete booking (User or Admin)
// @route DELETE /api/bookings/:id
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to modify this booking' });
    }

    // If booking is ALREADY cancelled or permanent deletion requested, delete document permanently from MongoDB
    if (booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'CANCELED' || req.query.permanent === 'true') {
      await Booking.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Booking record deleted permanently', deletedId: req.params.id });
    }

    // Otherwise, set bookingStatus to CANCELLED
    booking.bookingStatus = 'CANCELLED';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
