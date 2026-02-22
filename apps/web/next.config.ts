import type { NextConfig } from "next";

// Fail fast on Vercel if Supabase env vars are missing (needed for static generation).
if (process.env.VERCEL === "1") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      "Vercel build needs Supabase env. In Vercel: Project → Settings → Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase Dashboard → API)."
    );
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ["@nonews/shared", "@nonews/ui"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
