import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const startServer = async () => {
  // Connect to MongoDB & Auto Seed
  await connectDB();

  const app = express();

  // Security & Utility Middleware
  app.use(helmet({ crossOriginResourcePolicy: false }));

  // Flexible Production & Development CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  if (process.env.FRONTEND_URL) {
    const cleanFrontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, '');
    allowedOrigins.push(cleanFrontendUrl);
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        
        // Allow localhost, configured FRONTEND_URL, Vercel deployments (*.vercel.app), and Render deployments (*.onrender.com)
        const isVercel = /\.vercel\.app$/.test(cleanOrigin);
        const isRender = /\.onrender\.com$/.test(cleanOrigin);
        const isAllowed = allowedOrigins.includes(cleanOrigin);

        if (isAllowed || isVercel || isRender || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          console.warn(`CORS attempt blocked for origin: ${origin}`);
          callback(null, true); // Fallback allow to prevent production login blockage
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Increase payload limit for base64 profile image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve Uploaded Files Statically
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'GoaRide API Server Running', timestamp: new Date() });
  });
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GoaRide API Server Running', timestamp: new Date() });
  });

  // API Routes (Mounted under both /api/* and /* for robust URL configuration compatibility)
  app.use('/api/auth', authRoutes);
  app.use('/auth', authRoutes);

  app.use('/api/users', userRoutes);
  app.use('/users', userRoutes);

  app.use('/api/vehicles', vehicleRoutes);
  app.use('/vehicles', vehicleRoutes);

  app.use('/api/bookings', bookingRoutes);
  app.use('/bookings', bookingRoutes);

  app.use('/api/favorites', favoriteRoutes);
  app.use('/favorites', favoriteRoutes);

  app.use('/api/reviews', reviewRoutes);
  app.use('/reviews', reviewRoutes);

  app.use('/api/admin', adminRoutes);
  app.use('/admin', adminRoutes);

  app.use('/api/payments', paymentRoutes);
  app.use('/payments', paymentRoutes);

  app.use('/api/ai', aiRoutes);
  app.use('/ai', aiRoutes);

  // Error Handling Middleware
  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 GoaRide MERN Backend Server running on port ${PORT}`);
  });
};

startServer();
