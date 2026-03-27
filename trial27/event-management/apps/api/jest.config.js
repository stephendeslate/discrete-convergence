process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-for-jest';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-for-jest';

/** @type {import('jest').Config} */
module.exports = {
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@event-management/shared(.*)$': '<rootDir>/../../packages/shared/src$1',
  },
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
  ],
  testEnvironment: 'node',
  forceExit: true,
  passWithNoTests: true,
};
