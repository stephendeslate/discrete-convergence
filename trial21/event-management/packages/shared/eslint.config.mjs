import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts'],
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'jest.config.js', 'src/**/*.spec.ts'],
  },
];
