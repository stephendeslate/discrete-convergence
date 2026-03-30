/** @type {import('jest').Config} */
module.exports = {
  displayName: 'web',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true, module: 'commonjs', target: 'ES2017', strict: true, skipLibCheck: true, isolatedModules: true, resolveJsonModule: true, moduleResolution: 'node', allowJs: true } }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.spec.{ts,tsx}', '<rootDir>/app/**/*.spec.{ts,tsx}'],
  moduleNameMapper: {
    '^@event-management/shared$': '<rootDir>/../../packages/shared/src',
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'lib/**/*.ts', '!app/**/layout.tsx'],
  coverageDirectory: 'coverage',
};
