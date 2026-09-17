import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Public routes are statically generated; only /studio and /api are dynamic.
  experimental: { optimizePackageImports: ["@dnd-kit/core", "@dnd-kit/sortable"] },
};

export default nextConfig;
