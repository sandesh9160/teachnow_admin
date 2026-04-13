import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "teachnowbackend.jobsvedika.in" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
