/**
 * Fetches up to 3 related articles: same author first, then same category (source).
 * Excludes the current article.
 */

import { createSupabaseClient } from "@nonews/shared";
import type { ArticleWithSource } from "@nonews/ui";

const RELATED_LIMIT = 3;

export async function getRelatedArticles(
  excludeArticleId: string,
  author: string | null,
  sourceId: string,
  category: string
): Promise<ArticleWithSource[]> {
  const supabase = createSupabaseClient();
  const seenIds = new Set<string>([excludeArticleId]);
  const result: ArticleWithSource[] = [];

  const select = "id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources(name)";

  if (author?.trim()) {
    const { data: byAuthor } = await supabase
      .from("articles")
      .select(select)
      .eq("status", "completed")
      .eq("author", author.trim())
      .neq("id", excludeArticleId)
      .order("published_at", { ascending: false })
      .limit(RELATED_LIMIT);

    for (const row of byAuthor ?? []) {
      if (!seenIds.has(row.id)) {
        seenIds.add(row.id);
        result.push(row as ArticleWithSource);
        if (result.length >= RELATED_LIMIT) return result;
      }
    }
  }

  const needed = RELATED_LIMIT - result.length;
  if (needed <= 0) return result;

  const { data: byCategory } = await supabase
    .from("articles")
    .select(select)
    .eq("status", "completed")
    .eq("source_id", sourceId)
    .neq("id", excludeArticleId)
    .order("published_at", { ascending: false })
    .limit(needed + seenIds.size);

  for (const row of byCategory ?? []) {
    if (result.length >= RELATED_LIMIT) break;
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      result.push(row as ArticleWithSource);
    }
  }

  return result;
}
