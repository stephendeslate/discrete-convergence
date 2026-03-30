/** @type {import('jest').Config} */
module.exports = {
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  testEnvironment: 'node',
  passWithNoTests: true,
};
