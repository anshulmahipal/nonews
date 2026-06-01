import { Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Linking } from "react-native";
import { supabase } from "../lib/supabase";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { isGoogleSignInNativeAvailable } from "../lib/googleSignIn";
import { StyleSheet } from "react-native";

const SCHEME = "editorialapp";

/** Parse editorialapp://article/<id> or editorialapp://morning-brief into path + params. */
function parseDeepLinkUrl(url: string | null): { pathname: string; params?: { id?: string } } | null {
  if (!url || !url.startsWith(`${SCHEME}://`)) return null;
  const path = url.slice(SCHEME.length + 3).replace(/^\//, "") || "";
  const [segment, id] = path.split("/").filter(Boolean);
  if (segment === "article" && id) {
    return { pathname: "/article/[id]", params: { id } };
  }
  if (segment === "morning-brief" || segment === "") {
    return { pathname: "/(tabs)" };
  }
  return null;
}

const queryClient = new QueryClient();

export default function RootLayout() {
  usePushNotifications();

  useEffect(() => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId || !isGoogleSignInNativeAvailable()) return;
    // require() keeps this off the critical path in Expo Go (no static import of native module).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    GoogleSignin.configure({ webClientId });
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      const parsed = parseDeepLinkUrl(event.url);
      if (parsed) {
        if (parsed.params?.id) {
          router.replace({ pathname: "/article/[id]", params: { id: parsed.params.id } });
        } else {
          router.replace(parsed.pathname as "/(tabs)");
        }
      }
    });
    return () => subscription.remove();
  }, []);

  /** Cold-start deep link only; default route is `app/index` → `/(tabs)`. */
  useEffect(() => {
    let alive = true;

    void (async () => {
      const initialUrl = await Linking.getInitialURL().catch(() => null);
      if (!alive) return;

      const parsed = parseDeepLinkUrl(initialUrl);
      if (parsed?.params?.id) {
        router.replace({ pathname: "/article/[id]", params: { id: parsed.params.id } });
      } else if (parsed) {
        router.replace("/(tabs)");
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/(tabs)");
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.flex1}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="login" options={{ title: "Sign In" }} />
            <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
            <Stack.Screen name="morning-brief" options={{ title: "Today's Edition" }} />
            <Stack.Screen name="saved-articles" options={{ title: "Saved Articles" }} />
            <Stack.Screen name="article/[id]" options={{ title: "Article" }} />
            <Stack.Screen name="author/[id]" options={{ title: "Author" }} />
            <Stack.Screen name="discover-authors" options={{ title: "Discover Authors" }} />
            <Stack.Screen name="terms" options={{ title: "Terms of Service" }} />
            <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
            <Stack.Screen name="about" options={{ title: "About" }} />
            <Stack.Screen name="contact" options={{ title: "Contact & Support" }} />
          </Stack>
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
