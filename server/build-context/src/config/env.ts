import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5175',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5175').split(','),
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/coworker-platform',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;
