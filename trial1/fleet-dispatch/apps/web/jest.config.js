/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@fleet-dispatch/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
};
