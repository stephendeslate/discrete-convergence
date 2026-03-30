/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@em/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
