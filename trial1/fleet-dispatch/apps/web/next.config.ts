import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fleet-dispatch/shared'],
  reactStrictMode: true,
};

export default nextConfig;
