import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
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

      console.log(`✅ Production MongoDB Atlas Connected: ${conn.connection.host}`);
      await autoSeedIfEmpty();
    } catch (error) {
      console.error(`❌ Production MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }

    return;
  }

  // Development environment check: Try specified MONGO_URI or local MongoDB service first
  const targetDevUri = mongoUri || 'mongodb://127.0.0.1:27017/goaride';

  try {
    const conn = await mongoose.connect(targetDevUri, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log(`✅ Persistent MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedIfEmpty();
    return;
  } catch (error) {
    console.log('ℹ️ Local MongoDB service not active. Initializing persistent embedded MongoDB server...');
  }

  // Development fallback to persistent MongoMemoryServer
  try {
    const devDbDir = path.join(process.cwd(), '.mongo_dev_data');
    if (!fs.existsSync(devDbDir)) {
      fs.mkdirSync(devDbDir, { recursive: true });
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: devDbDir,
        storageEngine: 'wiredTiger',
      },
    });

    const persistentDevUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(persistentDevUri);

    console.log(`✅ Embedded Persistent Dev MongoDB Connected at: ${devDbDir}`);
    await autoSeedIfEmpty();
  } catch (memErr) {
    console.error(`❌ Embedded MongoDB Connection Error: ${memErr.message}`);
    process.exit(1);
  }
};

export default connectDB;