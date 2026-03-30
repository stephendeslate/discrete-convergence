/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@analytics-engine/shared'],
};

module.exports = nextConfig;
