// Supabase Edge Function: daily-ingestor
// Fetches active RSS feeds in parallel, parses XML, scrapes articles with Readability (sequential), inserts into articles.

import { createClient } from "@supabase/supabase-js";
import { parseHTML, DOMParser } from "linkedom";
import { Readability } from "@mozilla/readability";

const CUTOFF_HOURS = 24;

interface SourceRow {
  id: string;
  name: string;
  rss_url: string;
  category: string;
  is_active: boolean;
}

interface RssItem {
  title: string;
  link: string;
  guid: string;
  pubDate: string | null;
  author: string | null;
}

interface ArticleToInsert {
  source_id: string;
  guid: string;
  title: string;
  link: string;
  author: string | null;
  published_at: string;
  raw_content: string | null;
  status: "pending";
  processed_date: string;
}

/**
 * Parse RSS or Atom XML and extract items with link, title, guid, pubDate, author.
 */
function parseRssItems(xml: string): RssItem[] {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const items: RssItem[] = [];

  // RSS 2.0: <item>
  const rssItems = doc.getElementsByTagName("item");
  for (let i = 0; i < rssItems.length; i++) {
    const el = rssItems[i];
    const title = el.getElementsByTagName("title")[0]?.textContent?.trim() ?? "";
    const link =
      el.getElementsByTagName("link")[0]?.textContent?.trim() ??
      el.getElementsByTagName("link")[0]?.getAttribute("href") ??
      "";
    const guid =
      el.getElementsByTagName("guid")[0]?.textContent?.trim() ?? (link || crypto.randomUUID());
    const pubDate = el.getElementsByTagName("pubDate")[0]?.textContent?.trim() ?? null;
    const author =
      el.getElementsByTagName("dc:creator")[0]?.textContent?.trim() ??
      el.getElementsByTagName("author")[0]?.textContent?.trim() ??
      null;
    if (title && link) items.push({ title, link, guid, pubDate, author });
  }

  // Atom: <entry>
  if (items.length === 0) {
    const entries = doc.getElementsByTagName("entry");
    for (let i = 0; i < entries.length; i++) {
      const el = entries[i];
      const title = el.getElementsByTagName("title")[0]?.textContent?.trim() ?? "";
      const linkEl = el.getElementsByTagName("link")[0];
      const link = linkEl?.getAttribute("href") ?? linkEl?.textContent?.trim() ?? "";
      const id =
        el.getElementsByTagName("id")[0]?.textContent?.trim() ?? (link || crypto.randomUUID());
      const updated =
        el.getElementsByTagName("updated")[0]?.textContent?.trim() ??
        el.getElementsByTagName("published")[0]?.textContent?.trim() ??
        null;
      const authorEl = el.getElementsByTagName("author")[0];
      const author = authorEl
        ? authorEl.getElementsByTagName("name")[0]?.textContent?.trim() ?? null
        : null;
      if (title && link) items.push({ title, link, guid: id, pubDate: updated, author });
    }
  }

  return items;
}

/**
 * Parse pubDate string to Date. Returns null if invalid.
 */
function parsePubDate(pubDate: string | null): Date | null {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  return isNaN(d.getTime()) ? null : d;
}

/** Result of scraping an article page with Readability.js */
interface ScrapeResult {
  rawContent: string | null;
  author: string | null;
}

/**
 * Scrape article URL with Readability.js to extract raw text and author byline.
 * Author is taken from Readability's byline (meta tags, article byline, etc.).
 */
async function scrapeWithReadability(url: string): Promise<ScrapeResult> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; EditorialQuickRead/1.0; +https://github.com/nonews)",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { rawContent: null, author: null };
    const html = await res.text();
    const { document } = parseHTML(html);
    const reader = new Readability(document);
    const article = reader.parse();
    const rawContent = article?.textContent?.trim() ?? null;
    const author = article?.byline?.trim() || null;
    return { rawContent, author };
  } catch {
    return { rawContent: null, author: null };
  }
}

/**
 * Get today's date in YYYY-MM-DD (UTC).
 */
function getProcessedDate(): string {
  return new Date().toISOString().split("T")[0];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Optional body when invoking from admin dashboard: sync only this source. */
interface InvokeBody {
  source_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase env" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: InvokeBody = {};
  try {
    if (req.method === "POST" && req.body) {
      body = (await req.json()) as InvokeBody;
    }
  } catch {
    // ignore invalid JSON body
  }

  const sourceIdFilter = body.source_id?.trim() || null;

  const query = supabase
    .from("sources")
    .select("id, name, rss_url, category, is_active")
    .eq("is_active", true);

  if (sourceIdFilter) {
    query.eq("id", sourceIdFilter);
  }

  const { data: sources, error: sourcesError } = await query;

  if (sourcesError || !sources?.length) {
    return new Response(
      JSON.stringify({
        error: sourceIdFilter ? "Source not found or inactive" : "Failed to fetch sources",
        details: sourcesError?.message,
        ingested: 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const cutoff = new Date(Date.now() - CUTOFF_HOURS * 60 * 60 * 1000);
  const processedDate = getProcessedDate();

  // 1. Fetch RSS feeds in parallel with Promise.allSettled
  const feedResults = await Promise.allSettled(
    (sources as SourceRow[]).map((s) =>
      fetch(s.rss_url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; EditorialQuickRead/1.0; +https://github.com/nonews)",
        },
        signal: AbortSignal.timeout(10000),
      }).then((r) => r.text())
    )
  );

  // 2. Parse feeds and collect items (filter by last 24h)
  const itemsBySource: { source: SourceRow; items: RssItem[] }[] = [];
  for (let i = 0; i < feedResults.length; i++) {
    const result = feedResults[i];
    if (result.status === "rejected") continue;
    const source = sources[i] as SourceRow;
    const items = parseRssItems(result.value).filter((item) => {
      const pubDate = parsePubDate(item.pubDate);
      return pubDate && pubDate >= cutoff;
    });
    if (items.length > 0) itemsBySource.push({ source, items });
  }

  // 3. Flatten to (source, item) pairs for sequential scraping
  const toProcess: { source: SourceRow; item: RssItem }[] = [];
  for (const { source, items } of itemsBySource) {
    for (const item of items) {
      toProcess.push({ source, item });
    }
  }

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  // 4. Process articles sequentially (scrape with Readability)
  for (const { source, item } of toProcess) {
    const { rawContent, author: scrapedAuthor } = await scrapeWithReadability(item.link);
    const publishedAt = parsePubDate(item.pubDate) ?? new Date();
    // Author: RSS first, then scraped byline, then source name (editorials often lack bylines)
    const author =
      item.author?.trim() || scrapedAuthor || source.name;
    const article: ArticleToInsert = {
      source_id: source.id,
      guid: item.guid,
      title: item.title,
      link: item.link,
      author: author || null,
      published_at: publishedAt.toISOString(),
      raw_content: rawContent,
      status: "pending",
      processed_date: processedDate,
    };

    const { data, error } = await supabase.from("articles").upsert(article, {
      onConflict: "guid",
      ignoreDuplicates: true,
    });

    if (error) {
      failed++;
    } else if (data && data.length > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  // Mark synced sources as healthy (for admin dashboard)
  const nowIso = new Date().toISOString();
  for (const source of sources as SourceRow[]) {
    await supabase
      .from("sources")
      .update({
        last_synced_at: nowIso,
        last_error_message: null,
        status: "healthy",
      })
      .eq("id", source.id);
  }

  return new Response(
    JSON.stringify({
      processed: toProcess.length,
      inserted,
      skipped,
      failed,
      message: `Ingested ${toProcess.length} articles: ${inserted} new, ${skipped} duplicates, ${failed} errors.`,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
