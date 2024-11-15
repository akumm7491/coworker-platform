import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async () => {
  try {
    // Enable debug mode for Mongoose
    mongoose.set('debug', true);

    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);

    // Configure connection options
    const options = {
      autoIndex: true, // Build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(config.database.url, options);
    
    console.log('MongoDB Connection Details:');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log('MongoDB Connected Successfully');
    
    // Handle errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      console.error('Full error details:', JSON.stringify(err, null, 2));
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Log all MongoDB operations in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName: string, method: string, ...args: any[]) => {
        console.log(`MongoDB Debug: ${collectionName}.${method}`, args);
      });
    }

  } catch (error) {
    console.error('MongoDB connection error:');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};
