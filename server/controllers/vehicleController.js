import Vehicle from '../models/Vehicle.js';

// @desc Get all vehicles with filtering, searching, sorting
// @route GET /api/vehicles
export const getVehicles = async (req, res) => {
  try {
    const { type, location, search, sort, maxPrice, category, transmission, fuel } = req.query;

    let query = {};

    if (type && type !== 'all') {
      query.type = type.toLowerCase();
    }

    if (location && location !== 'all') {
      query.location = { $regex: new RegExp(location, 'i') };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (transmission && transmission !== 'all') {
      query.transmission = transmission;
    }

    if (fuel && fuel !== 'all') {
      query.fuelType = fuel;
    }

    if (maxPrice) {
      query.pricePerDay = { $lte: Number(maxPrice) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions = {};
    if (sort === 'price_low') {
      sortOptions.pricePerDay = 1;
    } else if (sort === 'price_high') {
      sortOptions.pricePerDay = -1;
    } else if (sort === 'rating') {
      sortOptions.rating = -1;
    } else {
      sortOptions.createdAt = -1; // Newest first by default
    }

    const vehicles = await Vehicle.find(query).sort(sortOptions);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get vehicle by ID
// @route GET /api/vehicles/:id
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new vehicle (Admin only)
// @route POST /api/vehicles
export const createVehicle = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      type,
      category,
      description,
      pricePerDay,
      securityDeposit,
      fuelType,
      transmission,
      seats,
      mileage,
      location,
      image,
      features,
    } = req.body;

    const vehicle = new Vehicle({
      name,
      brand: brand || name.split(' ')[0],
      model: model || '',
      type,
      category: category || (type === 'bike' ? 'Scooter' : 'Hatchback'),
      description: description || 'Premium rental vehicle in Goa.',
      pricePerDay: Number(pricePerDay),
      securityDeposit: Number(securityDeposit || 1000),
      fuelType: fuelType || 'Petrol',
      transmission: transmission || 'Manual',
      seats: seats || (type === 'bike' ? '2 seats' : '5 seats'),
      mileage: mileage || '40 km/l',
      location: location || 'Calangute',
      image: image || (req.file ? `/uploads/${req.file.filename}` : 'https://placehold.co/800x600/0b1727/ffffff?text=Vehicle'),
      features: features ? (Array.isArray(features) ? features : features.split(',').map((f) => f.trim())) : undefined,
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update vehicle (Admin only)
// @route PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    vehicle.name = req.body.name || vehicle.name;
    vehicle.brand = req.body.brand || vehicle.brand;
    vehicle.model = req.body.model || vehicle.model;
    vehicle.type = req.body.type || vehicle.type;
    vehicle.category = req.body.category || vehicle.category;
    vehicle.description = req.body.description || vehicle.description;
    vehicle.pricePerDay = req.body.pricePerDay !== undefined ? Number(req.body.pricePerDay) : vehicle.pricePerDay;
    vehicle.securityDeposit = req.body.securityDeposit !== undefined ? Number(req.body.securityDeposit) : vehicle.securityDeposit;
    vehicle.fuelType = req.body.fuelType || vehicle.fuelType;
    vehicle.transmission = req.body.transmission || vehicle.transmission;
    vehicle.seats = req.body.seats || vehicle.seats;
    vehicle.mileage = req.body.mileage || vehicle.mileage;
    vehicle.location = req.body.location || vehicle.location;
    vehicle.image = req.body.image || vehicle.image;
    vehicle.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : vehicle.isAvailable;

    if (req.body.features) {
      vehicle.features = Array.isArray(req.body.features) ? req.body.features : req.body.features.split(',').map((f) => f.trim());
    }

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete vehicle (Admin only)
// @route DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
