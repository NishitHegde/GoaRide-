import mongoose from 'mongoose';
import Trip from '../models/Trip.js';

export const initTrackingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`📡 Socket Connected: ${socket.id}`);

    // Join specific trip room for customer/driver updates
    socket.on('join-trip', (tripId) => {
      if (tripId) {
        socket.join(`trip_${tripId}`);
        console.log(`Socket ${socket.id} joined trip_${tripId}`);
      }
    });

    // Join admin master telemetry room
    socket.on('join-admin', () => {
      socket.join('admin_telemetry');
      console.log(`Socket ${socket.id} joined admin_telemetry`);
    });

    // Driver location update broadcast handler
    socket.on('driver-location-update', async (data) => {
      try {
        const { tripId, lat, lng, speed = 0, heading = 0, batteryFuel = 100 } = data;

        if (!tripId || lat === undefined || lng === undefined) return;

        const updatePayload = {
          lat,
          lng,
          speed,
          heading,
          batteryFuel,
          updatedAt: new Date(),
        };

        // Broadcast to clients in this trip room & admin telemetry room immediately
        io.to(`trip_${tripId}`).emit('telemetry-update', updatePayload);
        io.to('admin_telemetry').emit('master-telemetry-update', {
          tripId,
          ...updatePayload,
        });

        // Safely persist to MongoDB if tripId is a valid Mongoose ObjectId
        if (mongoose.Types.ObjectId.isValid(tripId)) {
          await Trip.findByIdAndUpdate(tripId, {
            currentGps: updatePayload,
            $push: {
              tripHistory: {
                lat,
                lng,
                speed,
                heading,
                batteryFuel,
                timestamp: new Date(),
              },
            },
          });
        }
      } catch (error) {
        console.error(`Socket location update error: ${error.message}`);
      }
    });

    // Emergency SOS Trigger
    socket.on('sos-trigger', async (data) => {
      try {
        const { tripId, message = 'Emergency SOS triggered by customer!' } = data;
        const sosItem = { timestamp: new Date(), message, resolved: false };

        io.to(`trip_${tripId}`).emit('sos-alert', sosItem);
        io.to('admin_telemetry').emit('admin-sos-alert', { tripId, ...sosItem });

        // Safely persist to MongoDB if tripId is a valid Mongoose ObjectId
        if (mongoose.Types.ObjectId.isValid(tripId)) {
          await Trip.findByIdAndUpdate(tripId, {
            $push: { sosAlerts: sosItem },
          });
        }
      } catch (error) {
        console.error(`Socket SOS error: ${error.message}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket Disconnected: ${socket.id}`);
    });
  });
};
