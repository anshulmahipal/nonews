import type { ConfigContext, ExpoConfig } from "expo/config";

/** Matches `extra.eas.projectId` in `app.json` (used if config merge omits it). */
const FALLBACK_EAS_PROJECT_ID = "0d6de4ca-7c11-4ad8-b616-8383718fede2";

/**
 * Injects Supabase URL/key into `extra` so `expo-constants` can read them at runtime
 * (in addition to Metro-inlined `EXPO_PUBLIC_*` from `.env`).
 *
 * Configures [EAS Update](https://docs.expo.dev/eas-update/introduction/) (OTA JS bundles):
 * `runtimeVersion` tracks `version` in `app.json`; bump `version` when native code changes.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const extra = config.extra as { eas?: { projectId?: string } } | undefined;
  const projectId = extra?.eas?.projectId ?? FALLBACK_EAS_PROJECT_ID;

  return {
    ...config,
    runtimeVersion: { policy: "appVersion" },
    updates: {
      enabled: true,
      url: `https://u.expo.dev/${projectId}`,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
    },
    extra: {
      ...config.extra,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
  } as ExpoConfig;
};
