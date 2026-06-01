import type { ConfigContext, ExpoConfig } from "expo/config";

/** Matches `extra.eas.projectId` in `app.json` (used if config merge omits it). */
const FALLBACK_EAS_PROJECT_ID = "0d6de4ca-7c11-4ad8-b616-8383718fede2";
const DEFAULT_ANDROID_VERSION_CODE = 1;

function parseAndroidVersionCode(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(
      `ANDROID_VERSION_CODE must be a positive integer, received: ${value}`,
    );
  }

  return parsed;
}

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
  const androidVersionCode =
    parseAndroidVersionCode(process.env.ANDROID_VERSION_CODE) ??
    config.android?.versionCode ??
    DEFAULT_ANDROID_VERSION_CODE;

  return {
    ...config,
    runtimeVersion: { policy: "appVersion" },
    android: {
      ...config.android,
      versionCode: androidVersionCode,
    },
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
