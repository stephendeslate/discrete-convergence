/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@event-management/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

module.exports = nextConfig;
