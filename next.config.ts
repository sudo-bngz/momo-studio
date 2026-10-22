import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Device photos are uploaded through a Server Action (1 MB by default).
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
