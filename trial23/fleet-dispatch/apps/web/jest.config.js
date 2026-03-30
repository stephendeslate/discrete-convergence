module.exports = {
  testEnvironment: 'jsdom',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@repo/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
};
