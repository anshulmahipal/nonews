import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nonews/shared", "@nonews/ui"],
};

export default nextConfig;
