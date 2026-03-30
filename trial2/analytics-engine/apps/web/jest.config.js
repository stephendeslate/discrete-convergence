/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
  },
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
  setupFilesAfterSetup: [],
};
