import mongoose from 'mongoose';
import { autoSeedIfEmpty } from '../seed/autoSeed.js';

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goaride';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.log('ℹ️ Local MongoDB instance not detected. Starting embedded MongoDB Memory Server for dev mode...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✅ Embedded MongoDB Server Connected: ${inMemoryUri}`);
      await autoSeedIfEmpty();
    } catch (memErr) {
      console.error(`MongoDB Connection Fatal Error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
