import { Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Linking } from "react-native";
import { supabase } from "../lib/supabase";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { ActivityIndicator, StyleSheet, View } from "react-native";

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

// Configure Google Sign-In (webClientId from Google Cloud Console)
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });
}

export default function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
  const [initialSession, setInitialSession] = useState<boolean | null>(null);

  usePushNotifications();

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

  const hasDoneInitialNav = useRef(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      Linking.getInitialURL(),
      supabase.auth.getSession().then(({ data: { session } }) => !!session),
    ]).then(([url, hasSession]) => {
      if (cancelled) return;
      setInitialSession(hasSession);
      setAuthReady(true);

      const parsed = parseDeepLinkUrl(url);
      if (parsed) {
        if (parsed.params?.id) {
          router.replace({ pathname: "/article/[id]", params: { id: parsed.params.id } });
        } else {
          router.replace("/(tabs)");
        }
      } else {
        if (hasSession) router.replace("/(tabs)");
        else router.replace("/login");
      }
      hasDoneInitialNav.current = true;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setInitialSession(!!session);
      if (!hasDoneInitialNav.current) return;
      if (session) router.replace("/(tabs)");
      else router.replace("/login");
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!authReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

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
            <Stack.Screen name="contact" options={{ title: "Contact us" }} />
          </Stack>
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
