/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        module: 'commonjs',
        esModuleInterop: true,
        strict: true,
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        paths: {
          '@/*': ['./*'],
          '@repo/shared': ['../../packages/shared/src'],
        },
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@repo/shared$': '<rootDir>/../../packages/shared/src',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};
