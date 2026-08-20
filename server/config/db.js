import mongoose from 'mongoose';
import { autoSeedIfEmpty } from '../seed/autoSeed.js';

let mongoMemoryServer = null;

const connectDB = async () => {
  // Production: use MongoDB Atlas / external MongoDB
  if (process.env.NODE_ENV === 'production') {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error('❌ MONGO_URI environment variable is not set.');
      process.exit(1);
    }

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      await autoSeedIfEmpty();
    } catch (error) {
      console.error(`❌ MongoDB Connection Fatal Error: ${error.message}`);
      process.exit(1);
    }

    return;
  }

  // Development: try local MongoDB first
  const mongoUri =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/goaride';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    await autoSeedIfEmpty();
  } catch (error) {
    console.log(
      'ℹ️ Local MongoDB not detected. Starting embedded MongoDB for development...'
    );

    try {
      const { MongoMemoryServer } =
        await import('mongodb-memory-server');

      mongoMemoryServer = await MongoMemoryServer.create();

      const inMemoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(inMemoryUri);

      console.log(
        `✅ Embedded MongoDB Server Connected: ${inMemoryUri}`
      );

      await autoSeedIfEmpty();
    } catch (memErr) {
      console.error(
        `❌ MongoDB Connection Fatal Error: ${memErr.message}`
      );

      process.exit(1);
    }
  }
};

export default connectDB;