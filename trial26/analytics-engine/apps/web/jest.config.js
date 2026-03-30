/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  collectCoverage: true,
  coverageReporters: ['json-summary'],
};
