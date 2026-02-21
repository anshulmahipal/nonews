import type { MetadataRoute } from "next";
import { createSupabaseClient } from "@nonews/shared";
import { getAllAuthorSlugs } from "./author/[slug]/getAuthorBySlug";
import { getAllTopicSlugs } from "./topic/[slug]/getTopicBySlug";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3005");

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

/**
 * Generates a valid XML sitemap: static pages + all completed editorials (priority 0.8) + author pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, authorSlugs, topicSlugs] = await Promise.all([
    getCompletedArticleSlugs(),
    getAllAuthorSlugs(),
    getAllTopicSlugs(),
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
