import type { NextConfig } from "next";
import path from "path";

const backendOrigin =
  (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
    .replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  // The container image runs this app with `node server.js`, which exists only
  // in the standalone bundle. The Cloudflare Worker build (build:cf, OpenNext)
  // must not have it, so the Dockerfile asks for it by setting the variable
  // rather than it being on for every build.
  ...(process.env.BUILD_STANDALONE === "true"
    ? { output: "standalone" as const, outputFileTracingRoot: path.join(__dirname, "../../") }
    : {}),
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ichef.bbci.co.uk",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      }
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node$": false,
      "sharp$": false,
    };
    return config;
  },
};


export default nextConfig;
