# Editorial Quick Read - Project Context

## Overview
A news-opinion aggregator that summarizes editorials into 80-word "Quick Reads" using Gemini 1.5 Flash.

## Core Architecture
- **Tech Stack**: Expo (Mobile), Next.js (Web), Supabase (Backend/DB).
- **Clean Architecture**: Use a monorepo (Turborepo). Shared logic in `packages/shared`.
- **Sync Schedule**: Daily morning batch at 5:00 AM IST (23:30 UTC).
- **Processing**: RSS -> Scrape Full Text (Readability.js) -> Gemini 1.5 Flash -> Supabase.

## AI Constraints (Gemini 1.5 Flash)
- **Summary**: Exactly 80 words (+/- 5).
- **Stance Labels**: [Supportive, Critical, Neutral, Sarcastic, Balanced].
- **Method**: Use Function Calling (`save_to_db` tool) for structured output.

## Database Schema (PostgreSQL)
- `sources`: (id, name, rss_url, category, is_active)
- `articles`: (id, source_id, guid, title, link, author, published_at, raw_content, ai_summary, ai_stance, status: pending|completed|failed)

# Editorial Quick Read
- **Goal**: Daily morning batch of summarized editorials.
- **Stack**: Expo, Next.js, Supabase, Gemini 1.5 Flash.
- **Logic**: RSS -> Scrape (Readability.js) -> Gemini (save_to_db tool) -> DB.