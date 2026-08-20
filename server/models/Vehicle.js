import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['bike', 'car'],
      required: true,
    },
    category: {
      type: String,
      default: 'Standard', // Scooter, Cruiser, Sports, Hatchback, SUV, Luxury
    },
    description: {
      type: String,
      default: 'Premium rental vehicle in Goa with top condition and clean documentation.',
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: 0,
    },
    pricePerHour: {
      type: Number,
      default: 0,
    },
    securityDeposit: {
      type: Number,
      default: 1000,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'EV'],
      default: 'Petrol',
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
      default: 'Manual',
    },
    seats: {
      type: String,
      default: '2 seats',
    },
    mileage: {
      type: String,
      default: '45 km/l',
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: [true, 'Vehicle image URL is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: ['Clean & Sanitized', 'Helmet Included', '24/7 Roadside Assistance', 'Insurance Included'],
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewCount: {
      type: Number,
      default: 12,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
