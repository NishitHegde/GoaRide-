import mongoose from 'mongoose';
import { autoSeedIfEmpty } from '../seed/autoSeed.js';

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  // Production environment check
  if (process.env.NODE_ENV === 'production') {
    if (!mongoUri) {
      console.error('❌ FATAL ERROR: Neither MONGO_URI nor MONGODB_URI environment variable is defined in production.');
      process.exit(1);
    }

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log(`✅ Production MongoDB Connected: ${conn.connection.host}`);
      await autoSeedIfEmpty();
    } catch (error) {
      console.error(`❌ Production MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }

    return;
  }

  // Development environment check
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      await autoSeedIfEmpty();
      return;
    } catch (error) {
      console.log('ℹ️ Specified MONGO_URI failed or local MongoDB not running. Falling back to embedded MongoDB...');
    }
  }

  // Development fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoMemoryServer.getUri();

    const conn = await mongoose.connect(inMemoryUri);
    console.log(`✅ Embedded Dev MongoDB Server Connected: ${inMemoryUri}`);
    await autoSeedIfEmpty();
  } catch (memErr) {
    console.error(`❌ Embedded MongoDB Connection Fatal Error: ${memErr.message}`);
    process.exit(1);
  }
};

export default connectDB;