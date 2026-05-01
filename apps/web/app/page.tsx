import type { ArticleWithSource } from "@nonews/ui";
import { getCachedHomeEditorialsFirstPage } from "@/lib/getHomeEditorials";
import { HomePageClient } from "./HomePageClient";

/**
 * ISR for `/` — keep in sync with `HOME_EDITORIALS_REVALIDATE_SECONDS` in `@/lib/getHomeEditorials`.
 * Next.js requires a literal here (not an imported binding).
 */
export const revalidate = 120;

export default async function HomePage() {
  let initialArticles: ArticleWithSource[] = [];
  try {
    initialArticles = await getCachedHomeEditorialsFirstPage();
  } catch {
    // Client will fetch via React Query
  }

  return <HomePageClient initialArticles={initialArticles} />;
}
