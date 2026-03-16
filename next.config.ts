import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.replit.dev",
    "*.spock.replit.dev",
  ],
  turbopack: {},
  webpack: (config) => {
    const setCssLoaderUrlFalse = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach(setCssLoaderUrlFalse);
        return;
      }
      if (obj.loader && typeof obj.loader === 'string' && obj.loader.includes('css-loader') && !obj.loader.includes('postcss')) {
        if (!obj.options) obj.options = {};
        if (typeof obj.options === 'object') {
          obj.options.url = false;
        }
      }
      Object.values(obj).forEach((val: any) => {
        if (val && typeof val === 'object') {
          setCssLoaderUrlFalse(val);
        }
      });
    };
    setCssLoaderUrlFalse(config.module);
    return config;
  },
};

export default nextConfig;
