import type { NextConfig } from "next";

const nextConfig = {
  // ... you might have other configurations here ...

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's.yimg.com',
        port: '',
        pathname: '/**', // This allows any path on this host
      },
      {
        protocol: 'https',
        hostname: 'media.zenfs.com', // Also a common Yahoo image host
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**'
      },
    ],
  },
};

export default nextConfig;
