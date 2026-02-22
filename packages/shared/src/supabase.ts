/**
 * Shared Supabase client factory.
 * Use env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (Next.js)
 * or EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (Expo).
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

const getEnvUrl = (): string => {
  if (typeof process !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      ""
    );
  }
  return (globalThis as unknown as { EXPO_PUBLIC_SUPABASE_URL?: string }).EXPO_PUBLIC_SUPABASE_URL ?? "";
};

const getEnvAnonKey = (): string => {
  if (typeof process !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      ""
    );
  }
  return (globalThis as unknown as { EXPO_PUBLIC_SUPABASE_ANON_KEY?: string }).EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
};

export interface SupabaseClientOptions {
  storage?: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
}

/**
 * Creates a type-safe Supabase client. Call from app code after env is set.
 * Pass storage for React Native to persist auth session (e.g. AsyncStorage).
 */
export function createSupabaseClient(options?: SupabaseClientOptions): SupabaseClient {
  const url = getEnvUrl();
  const anonKey = getEnvAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_* equivalents"
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: options?.storage
      ? {
          storage: options.storage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        }
      : undefined,
  });
}

/** Singleton client for server/Node usage; create per-request in Edge/Serverless if needed. */
let defaultClient: SupabaseClient | null = null;

/**
 * Returns a shared Supabase client instance. Prefer createSupabaseClient() in apps
 * so each app can pass its own env.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!defaultClient) {
    defaultClient = createSupabaseClient();
  }
  return defaultClient;
}
