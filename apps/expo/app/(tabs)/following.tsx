import { supabase } from "../../lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, UserPlus } from "lucide-react-native";

interface FollowedAuthor {
  id: string;
  name: string;
  image_url: string | null;
}

function getMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0]?.length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

export default function FollowingTab() {
  const { data: followedAuthors = [], isLoading, error } = useQuery({
    queryKey: ["followed-authors"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data: followRows, error: followError } = await supabase
        .from("follows")
        .select("author_id")
        .eq("user_id", session.user.id);

      if (followError) throw followError;
      const authorIds = (followRows ?? []).map((r) => r.author_id).filter(Boolean);
      if (authorIds.length === 0) return [] as FollowedAuthor[];

      const { data: authorRows, error: authorError } = await supabase
        .from("authors")
        .select("id, name, image_url")
        .in("id", authorIds);

      if (authorError) throw authorError;
      return (authorRows ?? []) as FollowedAuthor[];
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: FollowedAuthor }) => (
      <Pressable
        onPress={() => router.push(`/author/${item.id}`)}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.avatar}
            accessibilityLabel={`${item.name} headshot`}
          />
        ) : (
          <View style={styles.monogramWrap}>
            <Text style={styles.monogramText}>{getMonogram(item.name)}</Text>
          </View>
        )}
        <Text style={[styles.authorName, { fontFamily: "Georgia" }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.chevron} />
      </Pressable>
    ),
    []
  );

  const keyExtractor = useCallback((item: FollowedAuthor) => item.id, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load authors.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>
            Following
          </Text>
          <Text style={styles.headerSubtitle}>
            Columnists you follow
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/discover-authors")}
          style={({ pressed }) => [
            styles.discoverButton,
            pressed && styles.discoverButtonPressed,
          ]}
        >
          <UserPlus size={18} color="#fff" />
          <Text style={styles.discoverButtonText}>Discover</Text>
        </Pressable>
      </View>

      {followedAuthors.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            <User size={64} color="#cbd5e1" strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
            No authors followed yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Discover columnists and follow them to see their editorials on Home.
          </Text>
          <Pressable
            onPress={() => router.push("/discover-authors")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <UserPlus size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Discover Authors</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={followedAuthors}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
  discoverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  discoverButtonPressed: { opacity: 0.85 },
  discoverButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    textAlign: "center",
    color: "#dc2626",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  rowPressed: { opacity: 0.7 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: "#e2e8f0",
  },
  monogramWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  monogramText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f8fafc",
    fontFamily: "Georgia",
  },
  authorName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
  },
  chevron: {
    width: 8,
    height: 8,
    marginLeft: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#94a3b8",
    transform: [{ rotate: "45deg" }],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIllustration: {
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#64748b",
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#94a3b8",
  },
  primaryButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  primaryButtonPressed: { opacity: 0.85 },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
