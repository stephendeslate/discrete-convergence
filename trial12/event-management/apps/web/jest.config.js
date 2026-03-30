module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@event-management/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^next/headers$': '<rootDir>/__mocks__/next/headers.ts',
    '^next/navigation$': '<rootDir>/__mocks__/next/navigation.ts',
  },
  testMatch: ['<rootDir>/__tests__/**/*.spec.tsx', '<rootDir>/__tests__/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
