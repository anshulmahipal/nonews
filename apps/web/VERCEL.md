# Vercel deployment (monorepo)

**Config:** `vercel.json` lives at the **repo root** (not in `apps/web`). It defines install, build, output, and crons.

## Recommended: Root Directory empty

1. **Vercel** → your project → **Settings** → **General**.
2. Leave **Root Directory** empty (repo root).
3. Build/install/output are read from **root `vercel.json`**:
   - **Install:** `npm install`
   - **Build:** `npx turbo build --filter=@nonews/web`
   - **Output:** `apps/web/.next`
4. Redeploy.

If you still get **404** after a successful build, Vercel may be running the server from the repo root instead of where `.next` lives. Then use the alternative below.

## Alternative: Root Directory = `apps/web` (if you see 404)

1. **Vercel** → **Settings** → **General**.
2. Set **Root Directory** to **`apps/web`**.
3. Turn on **“Include source files outside of the Root Directory”**.
4. In **Build & Development Settings**, override so the build runs from the monorepo root:
   - **Install Command:** `cd ../.. && npm install`
   - **Build Command:** `cd ../.. && npx turbo build --filter=@nonews/web`
   - **Output Directory:** `.next`
5. Redeploy.

### Common errors when root is `apps/web`

- **“No workspaces found” / “Cannot find module '@nonews/shared'”**  
  → Enable **“Include source files outside of the Root Directory”**.

- **“turbo: command not found”**  
  → Use Build Command: `cd ../.. && npx turbo build --filter=@nonews/web`.

- **Build OK but 404 in browser**  
  → Root Directory must be exactly `apps/web` and you must redeploy after changing it.

## Test production locally

From the **repo root**:

```bash
npm run start:web
```

This builds the web app and runs `next start` from `apps/web`, so you can test production behavior at http://localhost:3000 (or the port shown). If this works but Vercel still returns 404, the cause is likely the runtime directory (Root Directory) on Vercel.
