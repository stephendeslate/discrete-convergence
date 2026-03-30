/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__', '<rootDir>/app', '<rootDir>/components', '<rootDir>/lib'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@fleet-dispatch/shared$': '<rootDir>/../../packages/shared/src/index',
  },
  coverageReporters: ['json-summary', 'text', 'lcov'],
  setupFilesAfterSetup: [],
};
