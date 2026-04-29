import type { SupabaseClient } from "./supabase";

/**
 * Columns for home / discovery lists (article + source name).
 * Prefer this over filtering by `processed_date` alone so older completed rows still appear.
 */
export const EDITORIAL_FEED_SELECT =
  "id, title, link, author, author_id, published_at, processed_date, ai_summary, ai_simplified_summary, ai_stance, sources(name)" as const;

/** Page size for infinite-scroll feeds (web + Expo home). */
export const EDITORIAL_FEED_PAGE_SIZE = 20;

/**
 * One page of completed editorials, newest first.
 *
 * Order by `processed_date` first (which pipeline day ingested/summarized this row), then
 * `published_at` (original editorial date from RSS). Sorting by RSS date alone buries
 * newer batches when feeds carry older pub dates.
 */
export async function fetchCompletedEditorialsPage(
  client: SupabaseClient,
  options: { limit: number; offset: number }
): Promise<unknown[]> {
  const { limit, offset } = options;
  const { data, error } = await client
    .from("articles")
    .select(EDITORIAL_FEED_SELECT)
    .eq("status", "completed")
    .order("processed_date", { ascending: false })
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

/**
 * Latest completed editorials for public feeds (anon + authenticated).
 * Prefer {@link fetchCompletedEditorialsPage} for infinite scroll.
 */
export async function fetchLatestCompletedEditorials(
  client: SupabaseClient,
  options?: { limit?: number }
): Promise<unknown[]> {
  const limit = options?.limit ?? 75;
  return fetchCompletedEditorialsPage(client, { limit, offset: 0 });
}
