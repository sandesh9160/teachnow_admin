import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";

let backendProtocol: "http" | "https" = "https";
let backendHostname = "teachnowbackend.jobsvedika.in";

try {
  const urlObj = new URL(backendUrl);
  backendProtocol = urlObj.protocol.replace(":", "") as "http" | "https";
  backendHostname = urlObj.hostname;
} catch (e) {
  // Fallback if URL parsing fails
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: backendProtocol, hostname: backendHostname },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend-assets/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
