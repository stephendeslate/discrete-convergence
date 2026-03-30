module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.spec.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true, module: 'commonjs', moduleResolution: 'node', target: 'ES2022', lib: ['dom', 'dom.iterable', 'ES2022'], strict: true, skipLibCheck: true, paths: { '@/*': ['./*'] }, types: ['jest', '@testing-library/jest-dom', 'jest-axe'] } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@event-management/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
