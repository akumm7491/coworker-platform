import { jest } from '@jest/globals';
import { initializeDatabase, AppDataSource } from '../config/database.js';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3457';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
process.env.POSTGRES_URL = 'postgres://postgres:postgres@localhost:5432/coworker_test';

// Mock environment configuration
jest.mock('../config/env', () => ({
  config: {
    corsOrigins: ['http://localhost:3456'],
    port: 3457,
    nodeEnv: 'test',
    clientUrl: 'http://localhost:3456',
    database: {
      url: 'postgres://postgres:postgres@localhost:5432/coworker_test',
    },
    jwt: {
      secret: 'test-jwt-secret',
      expiresIn: '30d',
    },
  },
}));

// Global test timeout
jest.setTimeout(30000);

// Initialize database before all tests
beforeAll(async () => {
  await initializeDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
