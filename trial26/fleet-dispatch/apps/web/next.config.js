/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/shared'],
  output: 'standalone',
};

module.exports = nextConfig;
