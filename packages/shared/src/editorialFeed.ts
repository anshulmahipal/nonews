import type { SupabaseClient } from "./supabase";

/**
 * Columns for home / discovery lists (article + source name).
 * Prefer this over filtering by `processed_date` alone so older completed rows still appear.
 */
export const EDITORIAL_FEED_SELECT =
  "id, title, link, author, author_id, published_at, processed_date, ai_summary, ai_simplified_summary, ai_stance, sources(name)" as const;

/**
 * Latest completed editorials for public feeds (anon + authenticated).
 * Orders by publication time so real Supabase data shows even when batch dates don’t match “today”.
 */
export async function fetchLatestCompletedEditorials(
  client: SupabaseClient,
  options?: { limit?: number }
): Promise<unknown[]> {
  const limit = options?.limit ?? 75;
  const { data, error } = await client
    .from("articles")
    .select(EDITORIAL_FEED_SELECT)
    .eq("status", "completed")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
