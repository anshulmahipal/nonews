# Vercel deployment (monorepo)

**Config:** `vercel.json` lives in **`apps/web`** (next to `next.config.ts`). It defines install, build, and crons. Do **not** set **Output Directory** in the Vercel dashboard for Next.js — Vercel uses the Next.js builder automatically.

## Git: branch `release/web` (production)

Use branch **`release/web`** for web releases. After you push to GitHub/GitLab, Vercel must treat that branch as **production**:

1. **Vercel** → your project → **Settings** → **Git**.
2. Set **Production Branch** to **`release/web`** (instead of `main` or `development`).
3. Push to **`release/web`** — each push triggers a production deployment to your production domain.

## Required: Root Directory = `apps/web`

1. **Vercel** → your project → **Settings** → **General**.
2. Set **Root Directory** to **`apps/web`**.
3. Turn on **“Include source files outside of the Root Directory”** (needed for `packages/*` workspaces).
4. Clear any **Output Directory** override in **Build & Development Settings** (leave empty / default for Next.js).
5. Install and build are read from **`apps/web/vercel.json`** (`cd ../.. && npm install`, turbo filter for `@nonews/web`). Redeploy.

### Common errors when root is `apps/web`

- **“No workspaces found” / “Cannot find module '@nonews/shared'”**  
  → Enable **“Include source files outside of the Root Directory”**.

- **“turbo: command not found”**  
  → Ensure **Build Command** matches `apps/web/vercel.json` (`cd ../.. && npx turbo build --filter=@nonews/web`).

- **Build OK but 404 in browser**  
  → Root Directory must be **`apps/web`**, not the repo root, and **Output Directory** must not point at `.next` manually.

## Test production locally

From the **repo root**:

```bash
npm run start:web
```

This builds the web app and runs `next start` from `apps/web`.
