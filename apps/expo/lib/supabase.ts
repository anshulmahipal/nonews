import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createSupabaseClient } from "@nonews/shared";

const extra = Constants.expoConfig?.extra as
  | { supabaseUrl?: string; supabaseAnonKey?: string }
  | undefined;

/**
 * Single Supabase client for the Expo app. Persists auth via AsyncStorage.
 * URL/key: `EXPO_PUBLIC_*` env (Metro) or `extra` from app.config.ts.
 */
export const supabase = createSupabaseClient({
  url: extra?.supabaseUrl?.trim() || undefined,
  anonKey: extra?.supabaseAnonKey?.trim() || undefined,
  storage: {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  },
});
