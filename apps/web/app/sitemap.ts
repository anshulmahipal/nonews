import type { MetadataRoute } from "next";
import { createSupabaseClient } from "@nonews/shared";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3005");

/** URL-safe slug from author name (inlined to avoid importing from author/[slug] in metadata route). */
function authorNameToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** URL-safe slug from category (inlined to avoid importing from topic/[slug] in metadata route). */
function categoryToSlug(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^#/, "");
}

/**
 * Fetches all completed article ids and their last updated time for the sitemap.
 */
async function getCompletedArticleSlugs(): Promise<{ id: string; updated_at: string | null }[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, updated_at")
    .eq("status", "completed")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as { id: string; updated_at: string | null }[];
}

async function getAuthorSlugs(): Promise<{ slug: string }[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("articles")
    .select("author")
    .not("author", "is", null)
    .eq("status", "completed");
  const rows = (data ?? []) as { author: string | null }[];
  const names = Array.from(new Set(rows.map((r) => (r.author as string).trim()).filter(Boolean)));
  const slugSet = new Set<string>();
  for (const name of names) {
    const s = authorNameToSlug(name);
    if (s) slugSet.add(s);
  }
  return Array.from(slugSet).map((slug) => ({ slug }));
}

async function getTopicSlugs(): Promise<{ slug: string }[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.from("sources").select("category").eq("is_active", true);
  const rows = (data ?? []) as { category: string }[];
  const slugSet = new Set<string>();
  for (const row of rows) {
    const s = categoryToSlug(row.category);
    if (s) slugSet.add(s);
  }
  return Array.from(slugSet).map((slug) => ({ slug }));
}

/**
 * Generates a valid XML sitemap: static pages + all completed editorials (priority 0.8) + author/topic pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authorSlugs, topicSlugs] = await Promise.all([
    getCompletedArticleSlugs(),
    getAuthorSlugs(),
    getTopicSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/editorials`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const editorialEntries: MetadataRoute.Sitemap = articles.map((row) => ({
    url: `${baseUrl}/editorials/${row.id}`,
    lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const authorEntries: MetadataRoute.Sitemap = authorSlugs.map(({ slug }) => ({
    url: `${baseUrl}/author/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const topicEntries: MetadataRoute.Sitemap = topicSlugs.map(({ slug }) => ({
    url: `${baseUrl}/topic/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...editorialEntries, ...authorEntries, ...topicEntries];
}
