/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fleet-dispatch/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

module.exports = nextConfig;
