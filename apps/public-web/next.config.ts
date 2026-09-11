import type { NextConfig } from "next";
import path from "path";

const backendOrigin =
  (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.editiontv.com/api/v1")
    .replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
      },
      {
        source: "/newsroom/:path*",
        destination: `${backendOrigin}/api/v1/newsroom/:path*`,
      },
      {
        source: "/articles/:path*",
        destination: `${backendOrigin}/api/v1/articles/:path*`,
      },
      {
        source: "/cms/:path*",
        destination: `${backendOrigin}/api/v1/cms/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${backendOrigin}/api/v1/auth/:path*`,
      },
      {
        source: "/users/:path*",
        destination: `${backendOrigin}/api/v1/users/:path*`,
      },
      {
        source: "/audit/:path*",
        destination: `${backendOrigin}/api/v1/audit/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${backendOrigin}/api/v1/media/:path*`,
      },
      {
        source: "/admin/:path*",
        destination: `${backendOrigin}/api/v1/admin/:path*`,
      },
    ];
  },

};


export default nextConfig;
