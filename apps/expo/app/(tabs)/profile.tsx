import { CONTACT_PAGE_URL, SUPPORT_EMAIL } from "@nonews/shared";
import { supabase } from "../../lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ChevronRight, FileText, Info, LogOut, Mail, Shield, User } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileTab() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      return s;
    },
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    }, [queryClient])
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/(tabs)");
  };

  const email = session?.user?.email ?? null;
  const displayName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.user_metadata?.name ??
    email?.split("@")[0] ??
    "Reader";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>
          Profile
        </Text>
        <Text style={styles.headerSubtitle}>
          Settings, support & account
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <User size={40} color="#64748b" strokeWidth={1.5} />
        </View>
        <Text style={[styles.displayName, { fontFamily: "Georgia" }]} numberOfLines={1}>
          {displayName}
        </Text>
        {email ? (
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        <View style={styles.linkList}>
          <Pressable
            onPress={() => router.push("/contact")}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
          >
            <Mail size={20} color="#64748b" strokeWidth={2} />
            <View style={styles.linkTextGroup}>
              <Text style={styles.linkLabel}>Contact & support</Text>
              <Text style={styles.linkMeta} numberOfLines={1}>
                {SUPPORT_EMAIL} · {CONTACT_PAGE_URL.replace(/^https?:\/\//, "")}
              </Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/about")}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
          >
            <Info size={20} color="#64748b" strokeWidth={2} />
            <View style={styles.linkTextGroup}>
              <Text style={styles.linkLabel}>About</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/terms")}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
          >
            <FileText size={20} color="#64748b" strokeWidth={2} />
            <View style={styles.linkTextGroup}>
              <Text style={styles.linkLabel}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/privacy")}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
          >
            <Shield size={20} color="#64748b" strokeWidth={2} />
            <View style={styles.linkTextGroup}>
              <Text style={styles.linkLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        {session?.user ? (
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
          >
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.signInButtonPressed,
            ]}
          >
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  linkList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  linkRowPressed: { opacity: 0.7 },
  linkTextGroup: {
    flex: 1,
    gap: 2,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  linkMeta: {
    fontSize: 13,
    color: "#64748b",
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  signOutButtonPressed: { opacity: 0.85 },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
  },
  signInButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  signInButtonPressed: { opacity: 0.85 },
  signInText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
