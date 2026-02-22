/**
 * Resolves author slug to canonical author name and fetches articles by that author.
 */

import { createSupabaseClient } from "@nonews/shared";
import type { ArticleWithSource } from "@nonews/ui";
import { authorNameToSlug } from "@/utils/slugs";

export interface AuthorPageData {
  authorName: string;
  articles: ArticleWithSource[];
}

/**
 * Fetches distinct author names from articles, finds the one that slugifies to the given slug,
 * then returns that name and all completed articles by that author.
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorPageData | null> {
  const supabase = createSupabaseClient();

  const { data: authorRows } = await supabase
    .from("articles")
    .select("author")
    .not("author", "is", null)
    .eq("status", "completed");

  const rows = (authorRows ?? []) as { author: string | null }[];
  const distinctNames = Array.from(
    new Set(rows.map((r) => (r.author as string).trim()).filter(Boolean))
  );
  const authorName = distinctNames.find((name) => authorNameToSlug(name) === slug) ?? null;
  if (!authorName) return null;

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources(name)")
    .eq("status", "completed")
    .eq("author", authorName)
    .order("published_at", { ascending: false });

  if (error) return null;
  return { authorName, articles: (articles ?? []) as ArticleWithSource[] };
}

/**
 * Returns distinct author names that have at least one completed article (for generateStaticParams).
 */
export async function getAllAuthorSlugs(): Promise<{ slug: string }[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("articles")
    .select("author")
    .not("author", "is", null)
    .eq("status", "completed");

  const rows = (data ?? []) as { author: string | null }[];
  const names = Array.from(
    new Set(rows.map((r) => (r.author as string).trim()).filter(Boolean))
  );
  const slugSet = new Set<string>();
  for (const name of names) {
    const s = authorNameToSlug(name);
    if (s) slugSet.add(s);
  }
  return Array.from(slugSet).map((slug) => ({ slug }));
}
