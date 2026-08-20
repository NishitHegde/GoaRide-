import Favorite from '../models/Favorite.js';
import Vehicle from '../models/Vehicle.js';

// @desc Toggle favorite status for a vehicle
// @route POST /api/favorites/:vehicleId
export const toggleFavorite = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({ user: userId, vehicle: vehicleId });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(existingFavorite._id);
      return res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      await Favorite.create({ user: userId, vehicle: vehicleId });
      return res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged-in user's favorites
// @route GET /api/favorites
export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).populate('vehicle');
    res.json(favorites.map((fav) => fav.vehicle).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
