import dotenv from 'dotenv';
import { baseLogger } from '../utils/baseLogger.js';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  server: {
    url: string;
  };
  client: {
    url: string;
  };
  cors: {
    origins: string[];
  };
  database: {
    url: string;
  };
  postgres: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
  };
  agent: {
    enabled: boolean;
    maxConcurrentTasks: number;
    taskTimeout: number;
    healthCheckInterval: number;
  };
}

function validateEnv(): void {
  const required = [
    'NODE_ENV',
    'BACKEND_PORT',
    'JWT_SECRET',
    'POSTGRES_URL',
    'CLIENT_URL',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV !== 'production') {
    baseLogger.warn(`Missing environment variables: ${missing.join(', ')}`);
    baseLogger.warn('The application will use default configurations for missing variables.');
    baseLogger.warn('Please check your .env file to ensure all required variables are set.');
  }
}

// Initialize configuration
validateEnv();

// Parse Postgres URL for connection details
const postgresUrl = new URL(
  process.env.POSTGRES_URL || 'postgres://postgres:postgres@postgres:5432/coworker',
);

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '3457', 10),
  server: {
    url: process.env.SERVER_URL || `http://localhost:${process.env.BACKEND_PORT || '3457'}`,
  },
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3456',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3456').split(',').filter(Boolean),
  },
  database: {
    url: process.env.POSTGRES_URL || 'postgres://postgres:postgres@postgres:5432/coworker',
  },
  postgres: {
    host: process.env.POSTGRES_HOST || postgresUrl.hostname,
    port: parseInt(process.env.POSTGRES_PORT || postgresUrl.port || '5432', 10),
    user: process.env.POSTGRES_USER || postgresUrl.username,
    password: process.env.POSTGRES_PASSWORD || postgresUrl.password,
    database: process.env.POSTGRES_DB || postgresUrl.pathname.slice(1),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3457/api/auth/google/callback',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  },
  agent: {
    enabled: process.env.AGENT_SYSTEM_ENABLED === 'true',
    maxConcurrentTasks: parseInt(process.env.AGENT_MAX_CONCURRENT_TASKS || '5', 10),
    taskTimeout: parseInt(process.env.AGENT_TASK_TIMEOUT || '300000', 10),
    healthCheckInterval: parseInt(process.env.AGENT_HEALTH_CHECK_INTERVAL || '30000', 10),
  },
};

// Configure logger with environment
import { configureLogger } from '../utils/logger.js';
configureLogger(config.nodeEnv);
