/**
 * Topic (category) landing pages: yourdomain.com/topic/indian-economy
 * Resolves slug to source category and fetches articles from that category.
 */

import { createSupabaseClient } from "@nonews/shared";
import type { ArticleWithSource } from "@nonews/ui";
import { categoryToSlug } from "../../../lib/topicSlug";

export interface TopicPageData {
  topicName: string;
  topicSlug: string;
  articles: ArticleWithSource[];
}

/**
 * Finds the category that slugifies to the given slug, then returns all completed articles
 * whose source has that category.
 */
export async function getTopicBySlug(slug: string): Promise<TopicPageData | null> {
  const supabase = createSupabaseClient();

  const { data: sources } = await supabase
    .from("sources")
    .select("id, category")
    .eq("is_active", true);

  const sourcesRows = (sources ?? []) as { id: string; category: string }[];
  const matchingSources = sourcesRows.filter((s) => categoryToSlug(s.category) === slug);
  if (matchingSources.length === 0) return null;

  const sourceIds = matchingSources.map((s) => s.id);
  const topicName = matchingSources[0].category;

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources(name)")
    .eq("status", "completed")
    .in("source_id", sourceIds)
    .order("published_at", { ascending: false });

  if (error) return null;

  return {
    topicName,
    topicSlug: slug,
    articles: (articles ?? []) as ArticleWithSource[],
  };
}

/**
 * Returns all topic slugs (from distinct source categories) for generateStaticParams and sitemap.
 */
export async function getAllTopicSlugs(): Promise<{ slug: string }[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("sources")
    .select("category")
    .eq("is_active", true);

  const slugs = new Set<string>();
  const categoryRows = (data ?? []) as { category: string }[];
  for (const row of categoryRows) {
    const s = categoryToSlug(row.category);
    if (s) slugs.add(s);
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}
