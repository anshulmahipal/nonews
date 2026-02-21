import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3005");

/**
 * Allows all crawlers; disallows /profile and /saved (user-specific, no index value).
 * References the generated sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/saved"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
