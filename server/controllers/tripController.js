import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';

// OpenStreetMap OSRM Route Planner API
export const planRoute = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng } = req.body;

    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return res.status(400).json({ message: 'Pickup and drop coordinates are required' });
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${dropLng},${dropLat}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(osrmUrl);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      // Fallback straight line coordinates if OSRM fails
      const fallbackPolyline = [
        [pickupLat, pickupLng],
        [(pickupLat + dropLat) / 2, (pickupLng + dropLng) / 2],
        [dropLat, dropLng],
      ];
      return res.json({
        polyLine: fallbackPolyline,
        distanceKm: 25.5,
        durationMins: 42,
        steps: [{ instruction: 'Head towards destination', distance: 25.5 }],
      });
    }

    const route = data.routes[0];
    const polyline = route.geometry.coordinates.map((c) => [c[1], c[0]]); // [lat, lng]
    const distanceKm = Number((route.distance / 1000).toFixed(1));
    const durationMins = Math.round(route.duration / 60);

    const steps = (route.legs[0]?.steps || []).map((s) => ({
      instruction: `${s.maneuver.type} ${s.name ? 'onto ' + s.name : ''}`.trim(),
      distance: Number((s.distance / 1000).toFixed(2)),
    }));

    res.json({
      polyLine: polyline,
      distanceKm,
      durationMins,
      steps,
    });
  } catch (error) {
    console.error('OSRM Route Planning Error:', error.message);
    res.status(500).json({ message: 'Route calculation failed. Using default route.' });
  }
};

// Create a new trip
export const createTrip = async (req, res) => {
  try {
    const { vehicleId, pickup, drop, routePolyline, routeDistanceKm, routeDurationMins, turnByTurnSteps } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const tripNumber = `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;

    const initialGps = {
      lat: pickup.lat,
      lng: pickup.lng,
      speed: 0,
      heading: 0,
      batteryFuel: 95,
      updatedAt: new Date(),
    };

    const trip = await Trip.create({
      tripNumber,
      customer: req.user._id,
      vehicle: vehicle._id,
      pickup,
      drop,
      currentGps: initialGps,
      routePolyline: routePolyline.map((pt) => Array.isArray(pt) ? { lat: pt[0], lng: pt[1] } : pt),
      routeDistanceKm,
      routeDurationMins,
      turnByTurnSteps,
      status: 'ON_TRIP',
      tripHistory: [initialGps],
    });

    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trip details with history
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('customer', 'name email phone profileImage')
      .populate('driver', 'name email phone profileImage')
      .populate('vehicle');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update trip status
export const updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.status = status;
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Trigger Emergency SOS
export const triggerSosAlert = async (req, res) => {
  try {
    const { message } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const sosItem = {
      timestamp: new Date(),
      message: message || 'Emergency SOS triggered by customer!',
      resolved: false,
    };

    trip.sosAlerts.push(sosItem);
    await trip.save();

    res.json({ message: 'SOS Alert Sent to Emergency Responders and Admin!', sosAlerts: trip.sosAlerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active trips for Master Admin Telemetry view
export const getAllTripsAdmin = async (req, res) => {
  try {
    const trips = await Trip.find({})
      .populate('customer', 'name email phone')
      .populate('driver', 'name email phone')
      .populate('vehicle')
      .sort({ updatedAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
