module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@fleet-dispatch/shared$': '<rootDir>/../../packages/shared/src',
  },
  collectCoverage: true,
  coverageReporters: ['json-summary'],
  coverageThreshold: {
    global: {
      branches: 60,
    },
  },
};
