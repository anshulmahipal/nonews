import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    if (Platform.OS !== "ios") return;
    setLoading("apple");
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple Sign-In failed – no identity token");
      }

      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (authError) throw authError;

      router.replace("/(tabs)");
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && e.code === "ERR_REQUEST_CANCELED") {
        setLoading(null);
        return;
      }
      setError(e instanceof Error ? e.message : "Apple sign-in failed");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading("google");
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (response.type === "cancelled" || response.type === "noSavedCredentialFound") {
        return;
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error("Google Sign-In failed – no ID token");
      }

      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (authError) throw authError;

      router.replace("/(tabs)");
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e) {
        const code = (e as { code?: string }).code;
        if (code === statusCodes.SIGN_IN_CANCELLED || code === statusCodes.IN_PROGRESS) {
          setLoading(null);
          return;
        }
      }
      setError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={[styles.title, { fontFamily: "Georgia" }]}>
          Editorial Quick Read
        </Text>
        <Text style={styles.subtitle}>
          Sign in to get your daily brief and push notifications.
        </Text>

        <View style={styles.buttons}>
          {Platform.OS === "ios" && (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={!!loading}
              style={({ pressed }) => [
                styles.button,
                styles.appleButton,
                pressed && !loading && styles.buttonPressed,
                loading === "apple" && styles.buttonLoading,
              ]}
            >
              {loading === "apple" ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color="#1c1917" />
                  <Text style={styles.loadingText}>Signing in…</Text>
                </View>
              ) : (
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              )}
            </Pressable>
          )}

          <Pressable
            onPress={handleGoogleSignIn}
            disabled={!!loading}
            style={({ pressed }) => [
              styles.button,
              styles.googleButton,
              pressed && !loading && styles.buttonPressed,
              loading === "google" && styles.buttonLoading,
            ]}
          >
            {loading === "google" ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator size="small" color="#f8fafc" />
                <Text style={[styles.loadingText, styles.loadingTextLight]}>Signing in…</Text>
              </View>
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  buttons: {
    width: "100%",
    gap: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  appleButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  googleButton: {
    backgroundColor: "#0f172a",
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1917",
  },
  loadingTextLight: {
    color: "#f8fafc",
  },
  error: {
    marginTop: 24,
    fontSize: 14,
    color: "#dc2626",
    textAlign: "center",
  },
});
