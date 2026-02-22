import { router } from "expo-router";
import { useEffect } from "react";

/** Legacy route: redirect to Home tab. */
export default function MorningBriefRedirect() {
  useEffect(() => {
    router.replace("/(tabs)");
  }, []);
  return null;
}
