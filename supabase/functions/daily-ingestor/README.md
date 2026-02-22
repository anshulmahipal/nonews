# daily-ingestor

Fetches active RSS feeds, scrapes article content with Readability.js, and inserts new articles into the `articles` table.

## Flow

1. **Query sources** – Fetches all rows from `sources` where `is_active = true`.
2. **Fetch RSS in parallel** – Uses `Promise.allSettled` to fetch all feeds concurrently.
3. **Parse XML** – Extracts items (RSS 2.0 `<item>` or Atom `<entry>`) with title, link, guid, pubDate, author.
4. **Filter** – Keeps only articles published in the last 24 hours.
5. **Scrape sequentially** – For each item, fetches the page and extracts text with Readability.js (sequential to avoid rate limiting).
6. **Insert** – Upserts into `articles` with `status = 'pending'`, skipping duplicates by `guid`.

## Invocation

Trigger via HTTP (e.g. from pg_cron + pg_net):

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/daily-ingestor \
  -H "Authorization: Bearer <anon-key>"
```

## Dependencies

- `@supabase/supabase-js` – Supabase client
- `linkedom` – DOM/XML parsing for RSS and HTML
- `@mozilla/readability` – Article content extraction
