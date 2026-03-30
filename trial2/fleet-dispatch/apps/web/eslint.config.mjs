import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['__tests__/', '.next/'],
  },
];

export default eslintConfig;
