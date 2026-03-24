/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@analytics-engine/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
