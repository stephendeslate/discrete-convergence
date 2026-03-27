/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
};
