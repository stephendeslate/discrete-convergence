/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  rootDir: '.',
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
  moduleNameMapper: {
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
  },
};
