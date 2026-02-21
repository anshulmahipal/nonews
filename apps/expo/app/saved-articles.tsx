import { router } from "expo-router";
import { useEffect } from "react";

/** Legacy route: redirect to Library tab. */
export default function SavedArticlesRedirect() {
  useEffect(() => {
    router.replace("/library");
  }, []);
  return null;
}
