// Set environment variables needed by AppModule
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-jest';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  moduleNameMapper: {
    '^@fleet-dispatch/shared(.*)$': '<rootDir>/../../packages/shared/src$1',
  },
};
