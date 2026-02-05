import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.website-files.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'undraw.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'illustrations.popsy.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
