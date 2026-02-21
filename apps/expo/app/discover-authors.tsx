import { supabase } from "../lib/supabase";
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
import { ArrowLeft, User } from "lucide-react-native";

interface AuthorWithCount {
  id: string;
  name: string;
  image_url: string | null;
  editorial_count: number;
}

/**
 * Derives a 1–2 letter monogram from the author's name.
 */
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

export default function DiscoverAuthorsScreen() {
  const { data: authors = [], isLoading, error } = useQuery({
    queryKey: ["discover-authors"],
    queryFn: async () => {
      const { data: countRows, error: countError } = await supabase
        .from("articles")
        .select("author_id")
        .eq("status", "completed")
        .not("author_id", "is", null);

      if (countError) throw countError;

      const countByAuthor: Record<string, number> = {};
      for (const row of countRows ?? []) {
        const id = row.author_id as string;
        countByAuthor[id] = (countByAuthor[id] ?? 0) + 1;
      }

      const authorIds = Object.keys(countByAuthor).filter((id) => countByAuthor[id] > 0);
      if (authorIds.length === 0) return [] as AuthorWithCount[];

      const { data: authorRows, error: authorError } = await supabase
        .from("authors")
        .select("id, name, image_url")
        .in("id", authorIds);

      if (authorError) throw authorError;

      const result: AuthorWithCount[] = (authorRows ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        image_url: a.image_url,
        editorial_count: countByAuthor[a.id] ?? 0,
      }));

      result.sort((a, b) => b.editorial_count - a.editorial_count);
      return result;
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: AuthorWithCount }) => (
      <Pressable
        onPress={() => router.push(`/author/${item.id}`)}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.rowPressed,
        ]}
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
        <View style={styles.rowText}>
          <Text style={[styles.authorName, { fontFamily: "Georgia" }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.editorialCount}>
            {item.editorial_count} Editorial{item.editorial_count !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.chevron} />
      </Pressable>
    ),
    []
  );

  const keyExtractor = useCallback((item: AuthorWithCount) => item.id, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading authors...</Text>
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
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
        >
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>
          Discover Authors
        </Text>
      </View>

      {authors.length === 0 ? (
        <View style={styles.emptyState}>
          <User size={48} color="#cbd5e1" strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
            No columnists yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Authors will appear here as editorials are added.
          </Text>
        </View>
      ) : (
        <FlatList
          data={authors}
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backPressed: { opacity: 0.7 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0f172a",
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
    paddingTop: 12,
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
  rowText: { flex: 1 },
  authorName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
  },
  editorialCount: {
    marginTop: 2,
    fontSize: 14,
    color: "#64748b",
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
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});
