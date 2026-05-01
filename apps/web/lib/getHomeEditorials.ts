import type { ArticleWithSource } from "@nonews/ui";
import {
  createSupabaseClient,
  EDITORIAL_FEED_PAGE_SIZE,
  fetchCompletedEditorialsPage,
} from "@nonews/shared";
import { unstable_cache } from "next/cache";

const HOME_FEED_CACHE_KEY = ["home-editorials-first-page"];
/** Align with route segment revalidate — stale data acceptable for public editorial list */
export const HOME_EDITORIALS_REVALIDATE_SECONDS = 120;

async function fetchHomeFirstPageUncached(): Promise<ArticleWithSource[]> {
  const supabase = createSupabaseClient();
  const rows = await fetchCompletedEditorialsPage(supabase, {
    limit: EDITORIAL_FEED_PAGE_SIZE,
    offset: 0,
  });
  return (rows ?? []) as ArticleWithSource[];
}

/**
 * First page of the home editorial feed, cached across requests (faster TTFB / fewer DB hits).
 */
export async function getCachedHomeEditorialsFirstPage(): Promise<
  ArticleWithSource[]
> {
  return unstable_cache(fetchHomeFirstPageUncached, HOME_FEED_CACHE_KEY, {
    revalidate: HOME_EDITORIALS_REVALIDATE_SECONDS,
    tags: ["editorial-feed-home"],
  })();
}
