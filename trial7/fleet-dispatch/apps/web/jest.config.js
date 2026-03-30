/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@fleet-dispatch/shared(.*)$': '<rootDir>/../../packages/shared/src$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
