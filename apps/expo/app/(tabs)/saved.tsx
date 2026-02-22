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
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Fixed folder labels for the Library grid. */
const FOLDER_GRID_LABELS = ["#Economy", "#Politics", "#Geopolitics", "#Tech"] as const;

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
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
          <Text className="mt-3 text-sm text-slate-500">Loading library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between px-4 pt-4 pb-2">
          <View>
            <Text className="text-[28px] font-semibold text-slate-900" style={{ fontFamily: "Georgia" }}>
              Library
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Folders · Authors · Recent saves
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/")}
            hitSlop={8}
            className="rounded-lg py-1 px-2 active:opacity-70"
          >
            <Text className="text-sm font-medium text-slate-900">Home</Text>
          </Pressable>
        </View>

        {/* Folder Grid: 4 squares */}
        <View className="px-4 pt-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Folders
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {FOLDER_GRID_LABELS.map((label, i) => {
              const { count } = folderCounts[i] ?? { count: 0 };
              const colors = ["bg-slate-200", "bg-sky-200", "bg-violet-200", "bg-amber-200"];
              const borderColors = ["border-slate-300", "border-sky-300", "border-violet-300", "border-amber-300"];
              return (
                <Pressable
                  key={label}
                  onPress={() => router.push("/library")}
                  className={`h-[88px] w-[88px] items-center justify-center rounded-xl border-2 ${borderColors[i]} ${colors[i]} active:opacity-80`}
                >
                  <Text className="text-center font-serif text-base font-semibold text-slate-800">
                    {label}
                  </Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900">
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Authors I Follow - horizontal scroll */}
        <View className="mt-6">
          <Text className="mb-3 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Authors I Follow
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", gap: 16 }}
          >
            {followedAuthors.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/50 px-5 py-4">
                <Text className="text-sm text-slate-500">
                  Follow authors from article pages
                </Text>
                <Pressable
                  onPress={() => router.push("/discover-authors")}
                  className="mt-2"
                >
                  <Text className="text-sm font-medium text-slate-700 underline">
                    Discover authors
                  </Text>
                </Pressable>
              </View>
            ) : (
              followedAuthors.map((author) => (
                <Pressable
                  key={author.id}
                  onPress={() => router.push(`/author/${author.id}`)}
                  className="items-center active:opacity-80"
                >
                  {author.image_url ? (
                    <Image
                      source={{ uri: author.image_url }}
                      className="h-14 w-14 rounded-full bg-slate-200"
                      accessibilityLabel={`${author.name} avatar`}
                    />
                  ) : (
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                      <Text className="font-serif text-base font-semibold text-slate-100">
                        {getMonogram(author.name)}
                      </Text>
                    </View>
                  )}
                  <Text
                    className="mt-1.5 max-w-[72px] text-center text-xs font-medium text-slate-700"
                    numberOfLines={2}
                  >
                    {author.name}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Recent Saves - last 5 bookmarks */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent Saves
          </Text>
          {!hasAnyBookmarks ? (
            <View className="items-center rounded-xl border border-slate-200 bg-white py-10">
              <Bookmark size={48} color="#cbd5e1" strokeWidth={1.5} />
              <Text className="mt-3 font-serif text-lg text-slate-500">
                No saved editorials yet
              </Text>
              <Text className="mt-1 text-center text-sm text-slate-400">
                Save articles from Home to see them here.
              </Text>
              <Pressable
                onPress={() => router.push("/")}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 active:opacity-85"
              >
                <Text className="text-sm font-semibold text-white">Go to Home</Text>
              </Pressable>
            </View>
          ) : recentSaves.length === 0 ? (
            <View className="rounded-xl border border-slate-200 bg-white py-8">
              <Text className="text-center text-sm text-slate-500">
                No recent saves.
              </Text>
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
              className="mt-2 rounded-lg border border-slate-200 bg-white py-3 active:opacity-80"
            >
              <Text className="text-center text-sm font-medium text-slate-600">
                View all saved →
              </Text>
            </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
