/** @type {import('jest').Config} */

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3001';
process.env.NODE_ENV = 'test';
process.env.THROTTLE_TTL = process.env.THROTTLE_TTL || '60';
process.env.THROTTLE_LIMIT = process.env.THROTTLE_LIMIT || '100';

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
  roots: ['<rootDir>/test/'],
  moduleNameMapper: {
    '^@fleet-dispatch/shared$': '<rootDir>/../../packages/shared/src',
  },
};
