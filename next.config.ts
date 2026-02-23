import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel 支持优化图片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
