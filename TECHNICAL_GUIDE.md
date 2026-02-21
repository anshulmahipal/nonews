# noNews Technical Guide

Technical documentation for the Editorial Quick Read pipeline: ingestion, scraping, AI summarization, and delivery.

---

## 1. Morning Batch Flow

The daily pipeline runs at **5:00 AM IST (23:30 UTC)** and follows this sequence:

```
pg_cron (23:30 UTC)
    │
    ▼
daily-ingestor (HTTP)
    │
    ├── 1. Query sources (is_active = true)
    ├── 2. Fetch RSS feeds in parallel
    ├── 3. Parse XML (RSS 2.0 / Atom)
    ├── 4. Filter: last 24 hours only
    ├── 5. Scrape each article with Readability.js (sequential)
    └── 6. Upsert into articles (status = 'pending')
    │
    ▼
ai-processor (HTTP)
    │
    ├── 1. Fetch articles where status = 'pending'
    ├── 2. For each: call Gemini 1.5 Flash (4s delay between calls)
    ├── 3. Parse save_to_db function response
    └── 4. Update articles: ai_summary, ai_stance, status = 'completed' | 'failed'
    │
    ▼
Database (articles ready for apps)
```

### Component Details

| Step | Component | Location | Description |
|------|-----------|----------|-------------|
| **Ingestor** | `daily-ingestor` | `supabase/functions/daily-ingestor/` | Fetches RSS, scrapes full text with Readability.js, inserts into `articles` |
| **Scraper** | `scrapeWithReadability()` | Inside daily-ingestor | Uses `@mozilla/readability` + `linkedom` to extract article body from HTML |
| **AI Processor** | `ai-processor` | `supabase/functions/ai-processor/` | Sends `raw_content` to Gemini, receives 80-word summary + stance via function calling |
| **Database** | `articles` table | Supabase | Stores `raw_content`, `ai_summary`, `ai_stance`, `status` |

### Triggering the Pipeline

The migration `0001_initial_schema.sql` schedules a **placeholder** pg_cron job at 23:30 UTC. To actually run the pipeline, you must invoke both Edge Functions via HTTP.

**Option A: pg_cron + pg_net (Supabase)**

1. Enable `pg_net` extension.
2. Store your `service_role` key in Vault (or use a secure secret).
3. Schedule two cron jobs that call `net.http_post` to your Edge Function URLs.

**Option B: External cron (e.g. GitHub Actions, Vercel Cron)**

```bash
# 1. Trigger ingestor
curl -X POST "https://<project-ref>.supabase.co/functions/v1/daily-ingestor" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"

# 2. After ingestor completes, trigger ai-processor
curl -X POST "https://<project-ref>.supabase.co/functions/v1/ai-processor" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>"
```

**Important:** Run `ai-processor` after `daily-ingestor` finishes. The ai-processor processes all rows with `status = 'pending'`.

---

## 2. Adding a New RSS Source

### Sources Table Schema

| Column | Type | Description |
|--------|------|--------------|
| `id` | uuid | Primary key (auto-generated) |
| `name` | text | Display name (e.g. "The Hindu") |
| `rss_url` | text | Full RSS/Atom feed URL |
| `category` | text | Default `'editorial'` |
| `is_active` | boolean | Default `true`; only active sources are ingested |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

### Add via SQL

```sql
INSERT INTO public.sources (name, rss_url, category, is_active)
VALUES (
  'The Hindu - Editorials',
  'https://www.thehindu.com/opinion/editorial/feeder/default.rss',
  'editorial',
  true
);
```

### Add via Supabase Dashboard

1. Go to **Table Editor** → `sources`
2. Click **Insert row**
3. Fill: `name`, `rss_url`, `category` (optional, defaults to `editorial`), `is_active` (default `true`)

### Supported Feed Formats

- **RSS 2.0**: `<item>` with `<title>`, `<link>`, `<guid>`, `<pubDate>`, `<dc:creator>` or `<author>`
- **Atom**: `<entry>` with `<title>`, `<link href>`, `<id>`, `<updated>`/`<published>`, `<author><name>`

Only items published in the **last 24 hours** are ingested. Set `is_active = false` to temporarily disable a source without deleting it.

---

## 2.1 Push Notifications (Morning Brief)

When the ai-processor finishes processing all pending articles and at least one completes successfully, it sends a push notification via the [Expo Push API](https://exp.host/--/api/v2/push/send).

- **Title:** 🗞️ Your Morning Brief is Ready
- **Body:** We've summarized today's top 5 editorials for you. Tap to read.
- **Targeting:** All `expo_push_token` values from the `profiles` table

### Profiles Table Schema

| Column | Type | Description |
|--------|------|--------------|
| `id` | uuid | Primary key (auto-generated) |
| `expo_push_token` | text | Expo push token (e.g. `ExponentPushToken[xxx]`) |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

### Registering for Push Notifications

The app must store the user's Expo push token in `profiles` when they grant notification permission:

```sql
INSERT INTO public.profiles (expo_push_token)
VALUES ('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]')
ON CONFLICT (expo_push_token) DO NOTHING;
```

Use `getExpoPushTokenAsync()` from `expo-notifications` in the Expo app, then upsert into `profiles` via Supabase client. See `NotificationService.ts` in the ai-processor for the server-side implementation.

---

## 3. Environment Variables

### Edge Functions (Supabase)

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | Yes | daily-ingestor, ai-processor | Supabase project URL (auto-injected by Supabase) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | daily-ingestor, ai-processor | Service role key for DB access (auto-injected) |
| `GEMINI_API_KEY` | Yes | ai-processor | Google AI API key for Gemini 1.5 Flash |

**Setting secrets for Edge Functions:**

```bash
supabase secrets set GEMINI_API_KEY=your_api_key_here
```

Or via **Supabase Dashboard** → **Edge Functions** → **Secrets**.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase when the function runs. You only need to set `GEMINI_API_KEY`.

### Frontend (Web / Mobile)

| Variable | Used By | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Anon (public) key |
| `EXPO_PUBLIC_SUPABASE_URL` | Expo | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Expo | Anon (public) key |

---

## 4. Troubleshooting

### Gemini Rate Limits

**Symptoms:** `ai-processor` returns 429 errors; articles stay in `status = 'pending'` or get `status = 'failed'`.

**Current behavior:** The ai-processor uses a **4-second delay** between Gemini calls (`DELAY_MS = 4000`) to stay under Free Tier RPM limits. There is no retry logic or exponential backoff.

**What to do:**

1. **Increase delay** – Edit `supabase/functions/ai-processor/index.ts` and raise `DELAY_MS` (e.g. to 6000 or 10000).
2. **Retry failed articles** – Re-run the ai-processor; it will pick up any rows with `status = 'pending'`. Failed rows stay `failed` unless you manually reset them:
   ```sql
   UPDATE articles SET status = 'pending' WHERE status = 'failed';
   ```
3. **Upgrade Gemini plan** – If you need higher throughput, use a paid tier and reduce or remove the delay.
4. **Add retry logic** – Implement exponential backoff on 429 responses (e.g. wait 30s, retry up to 3 times).

### News Site Blocks the Scraper

**Symptoms:** Articles are inserted with `raw_content = null`; ai-processor marks them `failed` because there is no content to summarize.

**Current behavior:** The ingestor uses:
- Custom User-Agent: `Mozilla/5.0 (compatible; EditorialQuickRead/1.0; +https://github.com/nonews)`
- 15-second timeout per article
- Sequential scraping (no parallel fetches) to reduce rate limiting
- Errors in `scrapeWithReadability` return `null`; the article is still inserted with `raw_content: null`

**What to do:**

1. **Check Supabase logs** – Edge Function logs may show HTTP 403/429 or connection errors.
2. **Change User-Agent** – Some sites block non-browser User-Agents. Try a common browser string:
   ```ts
   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
   ```
3. **Add delays between scrapes** – Insert a small delay (e.g. 1–2 seconds) between article fetches to avoid IP throttling.
4. **Use a proxy or headless browser** – For heavily protected sites, consider a service like ScrapingBee, Browserless, or a headless Chrome in a separate worker.
5. **Disable the source** – If a site consistently blocks you, set `is_active = false` on that source until you have a workaround.

### RSS Feed Fails to Fetch

**Symptoms:** No articles from a specific source; ingestor returns `ingested: 0` or skips that feed.

**Current behavior:** Feeds are fetched in parallel with `Promise.allSettled`. Failed feeds are skipped; no retries.

**What to do:**

1. **Verify the RSS URL** – Open it in a browser; ensure it returns valid XML.
2. **Check CORS / auth** – Some feeds require auth or specific headers.
3. **Add retry logic** – Implement retries with backoff for transient network errors.
4. **Inspect logs** – Check Edge Function logs for the specific feed error.

### Articles Stuck in `pending`

**Possible causes:**
- ai-processor was never invoked after the ingestor.
- ai-processor crashed or timed out partway through.
- All articles have `raw_content = null` (scraper blocked).

**What to do:**

1. Manually invoke the ai-processor:
   ```bash
   curl -X POST "https://<project-ref>.supabase.co/functions/v1/ai-processor" \
     -H "Authorization: Bearer <ANON_KEY>"
   ```
2. Check for `raw_content = null`:
   ```sql
   SELECT id, title, raw_content IS NULL as no_content FROM articles WHERE status = 'pending';
   ```
3. If many have `raw_content = null`, address scraper blocking (see above).

---

## Quick Reference

| Task | Command / Action |
|------|------------------|
| Run ingestor manually | `curl -X POST .../functions/v1/daily-ingestor -H "Authorization: Bearer <KEY>"` |
| Run ai-processor manually | `curl -X POST .../functions/v1/ai-processor -H "Authorization: Bearer <KEY>"` |
| Reset failed articles for retry | `UPDATE articles SET status = 'pending' WHERE status = 'failed';` |
| Disable a source | `UPDATE sources SET is_active = false WHERE id = '<uuid>';` |
| View Edge Function logs | Supabase Dashboard → Edge Functions → Logs |
