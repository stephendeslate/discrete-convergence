/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@repo/shared$': '<rootDir>/../../packages/shared/src',
  },
  collectCoverage: true,
  coverageReporters: ['text', 'json-summary'],
  coverageDirectory: 'coverage',
};
