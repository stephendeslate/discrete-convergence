/** @type {import('jest').Config} */
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-secret-for-jest';
process.env['CORS_ORIGIN'] = process.env['CORS_ORIGIN'] || 'http://localhost:3000';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] || 'postgresql://test:test@localhost:5432/test';

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
  },
};
