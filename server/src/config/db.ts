import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/chandandijobs';
    logger.info(`Attempting connection to MongoDB at: ${connString.replace(/:([^@]+)@/, ':****@')}`);
    
    const conn = await mongoose.connect(connString);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
