import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../../.env') });

export const config = {
  port: process.env.PORT || 3457,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3456',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3456').split(','),
  database: {
    url: process.env.DATABASE_URL || 'mongodb://mongodb:27017/coworker-platform',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
} as const;
