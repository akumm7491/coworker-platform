module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@coworker/shared-kernel$': '<rootDir>/../../packages/shared-kernel/src'
  },
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
};
