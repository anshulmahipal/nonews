import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nonews/shared", "@nonews/ui"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
