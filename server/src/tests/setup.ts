import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3457';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';

// Mock environment configuration
jest.mock('../config/env', () => ({
  config: {
    corsOrigins: ['http://localhost:3456'],
    port: 3457,
    nodeEnv: 'test',
    clientUrl: 'http://localhost:3456',
    database: {
      url: 'mongodb://mongodb:27017/coworker-platform-test',
    },
    jwt: {
      secret: 'test-jwt-secret',
      expiresIn: '30d',
    },
  },
}));

// Global test timeout
jest.setTimeout(30000);
