process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key-for-jest';

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/', '<rootDir>/src/'],
  moduleNameMapper: {
    '^@event-management/shared$': '<rootDir>/../../packages/shared/src',
  },
};
