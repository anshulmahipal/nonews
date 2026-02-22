import { router } from "expo-router";
import { useEffect } from "react";

/**
 * Root index redirects to tabs (or login is handled by root layout).
 * Kept so "/" is a valid route; root _layout redirects after auth check.
 */
export default function IndexRedirect() {
  useEffect(() => {
    router.replace("/(tabs)");
  }, []);
  return null;
}
