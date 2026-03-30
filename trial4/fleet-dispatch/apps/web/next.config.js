/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fleet-dispatch/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

module.exports = nextConfig;
