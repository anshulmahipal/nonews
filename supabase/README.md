# Supabase: local dev and deployment

## Initialize (already done)

This project was initialized with:

```bash
npx supabase init --force
```

You get `supabase/config.toml`, and existing `supabase/migrations/` and `supabase/functions/` are kept.

---

## Start local Supabase (Docker)

Start all local Supabase services (Postgres, API, Auth, Studio, Storage, Edge Functions, etc.) in Docker:

```bash
npx supabase start
```

**First run:** Downloads images and starts containers. This can take a few minutes.

**After it finishes** you’ll see:

- **API URL** – e.g. `http://127.0.0.1:54321`
- **Studio URL** – e.g. `http://127.0.0.1:54323` (DB UI, SQL, table data)
- **anon key** and **service_role key** – for local API/auth
- **DB URL** – for direct Postgres connections

Migrations in `supabase/migrations/` are applied automatically when the DB starts.

**Useful commands:**

- **Stop:** `npx supabase stop`
- **Status:** `npx supabase status`
- **Reset DB (re-run migrations):** `npx supabase db reset`

---

## Edge Functions: local secrets

Secrets for **local** Edge Function runs live in:

**`supabase/functions/.env`**

Example:

```env
GEMINI_API_KEY=your_actual_key_here
```

1. Copy or rename from the example and set your real key.
2. Get a key from [Google AI Studio](https://makersuite.google.com/app/apikey).
3. This file is **gitignored**; don’t commit real keys.

When you run `supabase functions serve` (or `supabase start` with Edge Runtime), the CLI loads these env vars for your functions.

**Remote (hosted) secrets** are set in the Supabase Dashboard → Project Settings → Edge Functions → Secrets (or via `supabase secrets set`), not in this file.

---

## DB schema (migrations)

- **Location:** `supabase/migrations/`
- **Push to remote:** After `npx supabase link --project-ref <ref>`, run `npx supabase db push` (or `npm run db:push` from repo root).

---

## Deploy Edge Functions

```bash
npx supabase functions deploy ai-processor
```

Set `GEMINI_API_KEY` in the Dashboard (Edge Function secrets) for the deployed function.
