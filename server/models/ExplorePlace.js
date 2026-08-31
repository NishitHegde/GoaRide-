import mongoose from 'mongoose';

const explorePlaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    locationQuery: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExplorePlace = mongoose.model('ExplorePlace', explorePlaceSchema);
export default ExplorePlace;
