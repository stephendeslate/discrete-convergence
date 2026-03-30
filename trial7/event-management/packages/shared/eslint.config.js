const tseslint = require('typescript-eslint');

module.exports = tseslint.config({
  files: ['src/**/*.ts'],
  extends: [tseslint.configs.recommended],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
});
