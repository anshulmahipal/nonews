# NoNews

NoNews is a monorepo for a **morning editorial brief** product. It ingests editorials from selected RSS sources, summarizes them with AI, and delivers them through web and mobile apps.

## What This Repo Contains

```text
apps/
  expo/        Canonical mobile app (Expo Router)
  web/         Next.js web app
packages/
  shared/      Shared Supabase client, domain types, and helpers
  ui/          Shared summary card UI
supabase/
  functions/   Edge Functions for ingest, AI processing, and simplification
  migrations/  Database schema and operational migrations
docs/          Product, app-flow, and release docs
archive/
  mobile-legacy/ Older duplicate Expo shell kept only for reference
```

## Canonical App Structure

- `apps/expo` is the only active mobile app.
- `apps/web` is the web app.
- `archive/mobile-legacy` is not part of the active workspace and should not be used for new work.

## Product Shape

The current product direction is:

- daily morning editorial brief
- concise AI summaries
- source attribution and read-through links
- bookmarks and followed authors as secondary personalization

## Core Pipeline

1. `daily-ingestor` fetches active RSS feeds and stores new articles as `pending`.
2. `ai-processor` summarizes pending articles and marks them `completed`.
3. Web and mobile apps display completed articles for the current edition.

## Main Commands

```bash
npm install
npm run build
npm run dev
```

Run a single app:

```bash
npm run dev --workspace=@nonews/expo
npm run dev --workspace=@nonews/web
```

## Important Docs

- `docs/PROJECT_CONTEXT.md`
- `docs/APP_FLOW.md`
- `docs/MONOREPO.md`
- `docs/FIRST_RELEASE_CHECKLIST.md`
- `TECHNICAL_GUIDE.md`

## Notes

- The root README previously described an older Firebase-era architecture. It now reflects the active Supabase + Next.js + Expo setup.
- If you are working on mobile, start in `apps/expo`.
