/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '(src/.*\\.spec\\.ts|test/.*\\.spec\\.ts)$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json-summary'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@em/shared$': '<rootDir>/../../packages/shared/src',
  },
  roots: ['<rootDir>/src', '<rootDir>/test'],
};
