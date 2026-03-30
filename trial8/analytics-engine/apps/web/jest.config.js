/** @type {import('jest').Config} */
module.exports = {
  displayName: 'web',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true, module: 'commonjs', target: 'ES2017', lib: ['dom', 'dom.iterable', 'esnext'], paths: { '@/*': ['./*'] }, moduleResolution: 'node' } }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}', '<rootDir>/app/**/*.spec.{ts,tsx}'],
  moduleNameMapper: {
    '^@analytics-engine/shared$': '<rootDir>/../../packages/shared/src',
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'lib/**/*.ts', '!app/**/layout.tsx'],
  coverageDirectory: 'coverage',
};
