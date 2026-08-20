import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      default: 15.4989,
    },
    longitude: {
      type: Number,
      default: 73.8278,
    },
  },
  {
    timestamps: true,
  }
);

const Location = mongoose.model('Location', locationSchema);
export default Location;
