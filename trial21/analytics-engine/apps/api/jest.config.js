/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/helpers/'],
  collectCoverage: true,
  coverageReporters: ['json-summary', 'text', 'lcov'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src/index',
  },
};
