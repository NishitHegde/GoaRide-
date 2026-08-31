import ExplorePlace from '../models/ExplorePlace.js';

// @desc Get all places to explore in Goa
// @route GET /api/explore-places
export const getExplorePlaces = async (req, res) => {
  try {
    const places = await ExplorePlace.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all places (including inactive) for admin
// @route GET /api/explore-places/admin
export const getAllExplorePlacesAdmin = async (req, res) => {
  try {
    const places = await ExplorePlace.find().sort({ order: 1, createdAt: -1 });
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new place to explore
// @route POST /api/explore-places
export const createExplorePlace = async (req, res) => {
  try {
    const { name, locationQuery, subtitle, image, order, isActive } = req.body;

    if (!name || !locationQuery || !subtitle || !image) {
      return res.status(400).json({ message: 'Please provide name, location query, subtitle, and image URL' });
    }

    const place = await ExplorePlace.create({
      name,
      locationQuery,
      subtitle,
      image,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a place to explore
// @route PUT /api/explore-places/:id
export const updateExplorePlace = async (req, res) => {
  try {
    const place = await ExplorePlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Explore place not found' });
    }

    place.name = req.body.name || place.name;
    place.locationQuery = req.body.locationQuery || place.locationQuery;
    place.subtitle = req.body.subtitle || place.subtitle;
    place.image = req.body.image || place.image;
    if (req.body.order !== undefined) place.order = req.body.order;
    if (req.body.isActive !== undefined) place.isActive = req.body.isActive;

    const updatedPlace = await place.save();
    res.json(updatedPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a place to explore
// @route DELETE /api/explore-places/:id
export const deleteExplorePlace = async (req, res) => {
  try {
    const place = await ExplorePlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Explore place not found' });
    }

    await place.deleteOne();
    res.json({ message: 'Explore place removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
