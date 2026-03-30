import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'coverage/', '.next/', 'jest.config.js', 'next.config.js', 'postcss.config.js', 'tailwind.config.js', 'next-env.d.ts'],
  },
];
