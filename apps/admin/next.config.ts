import type { NextConfig } from "next";
import path from "path";

// Dev  → NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1   (from .env.development)
// Prod → NEXT_PUBLIC_API_URL=https://edition-tv-backend.onrender.com/api/v1 (from .env.production)
// Production origin (commented out for dev testing): "https://edition-tv-backend.onrender.com/api/v1"
const backendOrigin =
  (process.env.NEXT_PUBLIC_API_URL ?? "https://api.editiontv.com/api/v1")
    .replace(/\/api\/v1\/?$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
