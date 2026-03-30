import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@event-management/shared'],
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
