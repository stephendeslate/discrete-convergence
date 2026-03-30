/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@event-management/shared'],
  output: 'standalone',
};

export default nextConfig;
