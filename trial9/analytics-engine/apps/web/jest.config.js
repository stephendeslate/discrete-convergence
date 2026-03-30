/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.spec.tsx', '**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        target: 'ES2017',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./*'],
          '@analytics-engine/shared': ['../../packages/shared/src'],
        },
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
