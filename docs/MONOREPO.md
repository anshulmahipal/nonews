# Turborepo Monorepo

## Structure

- **`apps/expo`** – Expo (React Native) app with Expo Router
- **`apps/web`** – Next.js app
- **`packages/shared`** – Supabase client and TypeScript types (sources, articles)

## Commands (from repo root)

```bash
# Install all dependencies (hoists workspace packages)
npm install

# Build all packages (required before first dev run; Turbo runs shared build before dev)
npm run build

# Run all apps in dev (builds shared first, then starts Expo and Next)
npm run dev

# Run a single app
npm run dev --workspace=@nonews/expo
npm run dev --workspace=@nonews/web
```

## Metro (Expo) and shared package

Metro is configured in `apps/expo/metro.config.js` to:

1. **`watchFolders: [monorepoRoot]`** – Watch the whole monorepo so changes in `packages/shared` are picked up.
2. **`resolver.nodeModulesPaths`** – Resolve modules from the app’s `node_modules` then the root `node_modules` (workspace hoisting).

`@nonews/shared` is resolved via the workspace link to `packages/shared`; its `main` points to `dist/index.js`, so run `npm run build` (or `turbo build`) once so `packages/shared` is compiled. When you run `npm run dev`, Turbo runs `build` for `@nonews/shared` before starting the Expo dev server.

## Env for Supabase

- **Next.js:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Expo:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Add these to `apps/web/.env.local` and `apps/expo/.env` (or use Expo’s env loading).
