import { supabase } from "../lib/supabase";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * Foreground notification behavior: show banner and play sound.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests push notification permission, fetches Expo push token,
 * and upserts it to Supabase profiles when the user is logged in.
 * Also listens for notification taps and navigates to Morning Brief.
 */
export function usePushNotifications() {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    let token: string | null = null;

    registerForPushNotificationsAsync().then((t) => {
      token = t;
      if (t) upsertTokenIfLoggedIn(t);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && token) {
        upsertTokenIfLoggedIn(token!);
      }
    });

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as
        | { articleId?: string }
        | undefined;
      const articleId = data?.articleId;

      if (articleId) {
        router.push({ pathname: "/article/[id]", params: { id: articleId } });
      } else {
        router.push("/(tabs)");
      }
    };

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) handleNotificationResponse(response);
    });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      responseListener.current?.remove();
      subscription.unsubscribe();
    };
  }, []);
}

/**
 * Requests permission and returns Expo push token.
 * Returns null if permission denied or not a physical device.
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0f172a",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  /** Permission payloads may expose `granted`, `status`, or iOS-only fields. */
  const allows = (perm: Notifications.NotificationPermissionsStatus) => {
    const p = perm as Notifications.NotificationPermissionsStatus & {
      granted?: boolean;
      status?: string;
    };
    return (
      p.granted === true ||
      p.status === "granted" ||
      perm.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  };

  let canNotify = allows(existing);

  if (!canNotify) {
    const requested = await Notifications.requestPermissionsAsync();
    canNotify = allows(requested);
  }

  if (!canNotify) {
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId: projectId as string | undefined,
    });
    return tokenResult.data;
  } catch {
    return null;
  }
}

/**
 * Upserts the Expo push token to profiles table if user is logged in.
 */
async function upsertTokenIfLoggedIn(expoPushToken: string): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const { id, email } = session.user;
    await supabase.from("profiles").upsert(
      {
        id,
        email: email ?? null,
        expo_push_token: expoPushToken,
      },
      { onConflict: "id" }
    );
  } catch {
    // Silently fail – token registration is non-critical
  }
}
