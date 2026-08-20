import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    pickup: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    drop: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    currentGps: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      speed: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      batteryFuel: { type: Number, default: 100 },
      updatedAt: { type: Date, default: Date.now },
    },
    routePolyline: [
      {
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    routeDistanceKm: {
      type: Number,
      default: 0,
    },
    routeDurationMins: {
      type: Number,
      default: 0,
    },
    turnByTurnSteps: [
      {
        instruction: { type: String },
        distance: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'ON_TRIP', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    tripHistory: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        speed: { type: Number, default: 0 },
        heading: { type: Number, default: 0 },
        batteryFuel: { type: Number, default: 100 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    sosAlerts: [
      {
        timestamp: { type: Date, default: Date.now },
        message: { type: String, default: 'Emergency SOS triggered!' },
        resolved: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
