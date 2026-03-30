import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: {
        project: './tsconfig.json',
        jsx: true,
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        FormData: 'readonly',
        RequestInit: 'readonly',
      },
    },
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'off',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'jest.config.js', 'coverage/**', '__tests__/**'],
  },
];
