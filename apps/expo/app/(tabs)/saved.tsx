import { supabase } from "../../lib/supabase";
import { CompactSummaryCard, type ArticleWithSource } from "@nonews/ui";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Bookmark } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Fixed folder labels for the Library grid. */
const FOLDER_GRID_LABELS = ["#Economy", "#Politics", "#Geopolitics", "#Tech"] as const;

const FOLDER_TILE_STYLES = [
  { backgroundColor: "#e2e8f0", borderColor: "#cbd5e1" },
  { backgroundColor: "#bae6fd", borderColor: "#7dd3fc" },
  { backgroundColor: "#ddd6fe", borderColor: "#c4b5fd" },
  { backgroundColor: "#fde68a", borderColor: "#fcd34d" },
] as const;

interface BookmarkWithArticle {
  article_id: string;
  folder_id: string | null;
  articles: ArticleWithSource | null;
}

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

/** Normalize folder name for matching (e.g. "#Economy" or "Economy" -> "economy"). */
function normalizeFolderName(name: string): string {
  return name.replace(/^#/, "").trim().toLowerCase();
}

export default function SavedTab() {
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ["bookmark-folders"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("bookmark_folders")
        .select("id, name, color")
        .eq("user_id", session.user.id)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: bookmarkRows, isLoading: bookmarksLoading } = useQuery({
    queryKey: ["saved-articles"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("bookmarks")
        .select(
          `article_id, folder_id, articles (id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources (name))`
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BookmarkWithArticle[];
    },
  });

  const { data: followedAuthors = [] } = useQuery({
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
      if (authorIds.length === 0) return [];
      const { data: authorRows, error: authorError } = await supabase
        .from("authors")
        .select("id, name, image_url")
        .in("id", authorIds);
      if (authorError) throw authorError;
      return (authorRows ?? []) as FollowedAuthor[];
    },
  });

  /** Count of saved articles per grid label (by folder name match). */
  const folderCounts = useMemo(() => {
    const rows = bookmarkRows ?? [];
    const countByFolderId = new Map<string, number>();
    for (const row of rows) {
      if (!row.articles) continue;
      const fid = row.folder_id ?? "__uncategorized__";
      countByFolderId.set(fid, (countByFolderId.get(fid) ?? 0) + 1);
    }
    return FOLDER_GRID_LABELS.map((label) => {
      const key = normalizeFolderName(label);
      const matchingFolderIds = (folders ?? [])
        .filter((f) => normalizeFolderName(f.name) === key)
        .map((f) => f.id);
      const count = matchingFolderIds.reduce(
        (sum, id) => sum + (countByFolderId.get(id) ?? 0),
        0
      );
      return { label, count };
    });
  }, [bookmarkRows, folders]);

  const recentSaves = useMemo(() => {
    const rows = bookmarkRows ?? [];
    const articles = rows
      .map((r) => r.articles)
      .filter((a): a is ArticleWithSource => a != null);
    return articles.slice(0, 5);
  }, [bookmarkRows]);

  const handleCardPress = useCallback((articleId: string) => {
    router.push({ pathname: "/article/[id]", params: { id: articleId } });
  }, []);

  const isLoading = foldersLoading || bookmarksLoading;
  const hasAnyBookmarks = (bookmarkRows ?? []).some((r) => r.articles != null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>Library</Text>
            <Text style={styles.headerSubtitle}>Folders · Authors · Recent saves</Text>
          </View>
          <Pressable
            onPress={() => router.push("/")}
            hitSlop={8}
            style={({ pressed }) => [styles.homeLink, pressed && styles.pressed]}
          >
            <Text style={styles.homeLinkText}>Home</Text>
          </Pressable>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Folders</Text>
          <View style={styles.folderGrid}>
            {FOLDER_GRID_LABELS.map((label, i) => {
              const { count } = folderCounts[i] ?? { count: 0 };
              const tile = FOLDER_TILE_STYLES[i];
              return (
                <Pressable
                  key={label}
                  onPress={() => router.push("/library")}
                  style={({ pressed }) => [
                    styles.folderTile,
                    {
                      backgroundColor: tile.backgroundColor,
                      borderColor: tile.borderColor,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.folderLabel, { fontFamily: "Georgia" }]}>{label}</Text>
                  <Text style={styles.folderCount}>{count}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.authorsBlock}>
          <Text style={[styles.sectionLabel, styles.sectionLabelPad]}>Authors I Follow</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.authorsScroll}
          >
            {followedAuthors.length === 0 ? (
              <View style={styles.authorsEmpty}>
                <Text style={styles.mutedText}>Follow authors from article pages</Text>
                <Pressable onPress={() => router.push("/discover-authors")} style={styles.discoverLinkWrap}>
                  <Text style={styles.discoverLink}>Discover authors</Text>
                </Pressable>
              </View>
            ) : (
              followedAuthors.map((author, idx) => (
                <Pressable
                  key={author.id}
                  onPress={() => router.push(`/author/${author.id}`)}
                  style={({ pressed }) => [
                    styles.authorItem,
                    idx < followedAuthors.length - 1 && styles.authorItemSpacer,
                    pressed && styles.pressed,
                  ]}
                >
                  {author.image_url ? (
                    <Image
                      source={{ uri: author.image_url }}
                      style={styles.authorAvatar}
                      accessibilityLabel={`${author.name} avatar`}
                    />
                  ) : (
                    <View style={styles.authorAvatarPlaceholder}>
                      <Text style={[styles.authorMonogram, { fontFamily: "Georgia" }]}>
                        {getMonogram(author.name)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.authorName} numberOfLines={2}>
                    {author.name}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>Recent Saves</Text>
          {!hasAnyBookmarks ? (
            <View style={styles.emptyCard}>
              <Bookmark size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>No saved editorials yet</Text>
              <Text style={styles.emptySubtitle}>Save articles from Home to see them here.</Text>
              <Pressable
                onPress={() => router.push("/")}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>Go to Home</Text>
              </Pressable>
            </View>
          ) : recentSaves.length === 0 ? (
            <View style={styles.mutedCard}>
              <Text style={styles.mutedTextCenter}>No recent saves.</Text>
            </View>
          ) : (
            <View>
              {recentSaves.map((item) => (
                <CompactSummaryCard
                  key={item.id}
                  item={item}
                  onPress={() => handleCardPress(item.id)}
                />
              ))}
              <Pressable
                onPress={() => router.push("/library")}
                style={({ pressed }) => [styles.viewAllButton, pressed && styles.pressed]}
              >
                <Text style={styles.viewAllText}>View all saved →</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
  homeLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  homeLinkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  sectionPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    marginBottom: 12,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  sectionLabelPad: {
    paddingHorizontal: 16,
  },
  folderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  folderTile: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  folderLabel: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  folderCount: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  authorsBlock: {
    marginTop: 24,
  },
  authorsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  authorsEmpty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 16,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: "100%",
  },
  mutedText: {
    fontSize: 14,
    color: "#64748b",
  },
  discoverLinkWrap: {
    marginTop: 8,
  },
  discoverLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    textDecorationLine: "underline",
  },
  authorItem: {
    alignItems: "center",
    width: 72,
  },
  authorItemSpacer: {
    marginRight: 16,
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
  },
  authorAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  authorMonogram: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
  },
  authorName: {
    marginTop: 6,
    maxWidth: 72,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "500",
    color: "#334155",
  },
  emptyCard: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
  },
  emptySubtitle: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 14,
    color: "#94a3b8",
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  mutedCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    paddingVertical: 32,
  },
  mutedTextCenter: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
  },
  viewAllButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  viewAllText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  pressed: {
    opacity: 0.85,
  },
});
