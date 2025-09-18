import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@coderscreen/ui'],
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
