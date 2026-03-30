module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
        strict: true,
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'ES2022'],
        paths: { '@/*': ['./*'] },
        types: ['jest', '@testing-library/jest-dom', '@types/jest-axe'],
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@event-management/shared$': '<rootDir>/../../packages/shared/src',
    '^next/headers$': '<rootDir>/__mocks__/next/headers.ts',
    '^next/navigation$': '<rootDir>/__mocks__/next/navigation.ts',
  },
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}'],
};
