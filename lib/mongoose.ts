import type { Mongoose } from 'mongoose';

import mongoose from 'mongoose';

import logger from './logger';
import '@/database';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

let cached = (globalThis as any).mongoose as MongooseCache;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    logger.info('MongoDB already connected');
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      dbName: 'devoverflow',
    }).then((result) => {
      logger.info('MongoDB connected');
      return result;
    }).catch((error) => {
      logger.error('MongoDB connection failed', error);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
