/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        esModuleInterop: true,
        moduleResolution: 'node',
        types: ['jest', '@testing-library/jest-dom', '@types/jest-axe'],
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(class-variance-authority|clsx|tailwind-merge)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testMatch: ['**/__tests__/**/*.spec.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'json-summary'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/utils.ts',
    '!**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 40,
      lines: 60,
      statements: 60,
    },
  },
};
