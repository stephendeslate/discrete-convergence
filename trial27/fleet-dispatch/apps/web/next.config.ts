// TRACED: FD-FE-010 — Next.js configuration
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fleet-dispatch/shared'],
};

export default nextConfig;
