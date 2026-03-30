import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['.next/', 'node_modules/', 'coverage/', 'jest.config.js', 'next.config.js', 'next-env.d.ts', 'tailwind.config.js', 'postcss.config.js', 'eslint.config.mjs'],
  },
];
