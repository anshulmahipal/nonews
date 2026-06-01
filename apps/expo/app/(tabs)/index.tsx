import { useBookmarks } from "../../hooks/useBookmarks";
import { rejectAfter } from "../../lib/raceAsync";
import { supabase } from "../../lib/supabase";
import {
  EDITORIAL_FEED_PAGE_SIZE,
  editorialCanonicalUrl,
  fetchCompletedEditorialsPage,
  shortenUrlForShare,
} from "@nonews/shared";
import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import { Coffee, FileText, Search, Users, X } from "lucide-react-native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Article with author_id for filtering by followed authors. */
type ArticleWithAuthorId = ArticleWithSource & {
  author_id: string | null;
  processed_date: string;
};

type Segment = "all" | "following";

/** User’s local calendar date (YYYY-MM-DD) — matches typical `processed_date` expectations better than UTC-only. */
function getLocalDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Shown when no articles are found for today — editors still at work. */
function EmptyStateAll() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.morningCoffeeIllustration}>
        <View style={styles.coffeeIconWrap}>
          <Coffee size={72} color="#a16207" strokeWidth={1.4} />
        </View>
      </View>
      <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
        The editors are still at work.
      </Text>
      <Text style={styles.emptySubtitle}>
        Check back in a few minutes!
      </Text>
    </View>
  );
}

function EmptyStateFollowing() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Users size={64} color="#cbd5e1" strokeWidth={1.5} />
      </View>
      <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
        No editorials from followed authors today.
      </Text>
      <Text style={styles.emptySubtitle}>
        Follow your favourite columnists to see their pieces here.
      </Text>
      <Pressable
        onPress={() => router.push("/discover-authors")}
        style={({ pressed }) => [
          styles.discoverButton,
          pressed && styles.discoverButtonPressed,
        ]}
      >
        <Text style={styles.discoverButtonText}>Discover Authors</Text>
      </Pressable>
    </View>
  );
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: Segment;
  onChange: (v: Segment) => void;
}) {
  return (
    <View style={styles.segmentedWrap}>
      <Pressable
        onPress={() => onChange("all")}
        style={[
          styles.segment,
          value === "all" && styles.segmentActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "all" && styles.segmentTextActive,
          ]}
        >
          All
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange("following")}
        style={[
          styles.segment,
          value === "following" && styles.segmentActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === "following" && styles.segmentTextActive,
          ]}
        >
          Following
        </Text>
      </Pressable>
    </View>
  );
}

/** Returns true if the article matches the search query (keywords in title or summary). */
function articleMatchesSearch(
  item: ArticleWithAuthorId,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const keywords = q.split(/\s+/).filter(Boolean);
  const title = (item.title ?? "").toLowerCase();
  const summary = (item.ai_summary ?? "").toLowerCase();
  const searchable = `${title} ${summary}`;
  return keywords.every((kw) => searchable.includes(kw));
}

export default function HomeTab() {
  const todayLocal = useMemo(() => getLocalDateString(), []);
  const [segment, setSegment] = useState<Segment>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const { data: followedAuthorIds = [] } = useQuery({
    queryKey: ["followed-author-ids"],
    queryFn: async () => {
      const session = await Promise.race([
        supabase.auth.getSession().then(({ data }) => data.session ?? null),
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 2_500);
        }),
      ]);
      if (!session?.user) return [];
      const { data, error } = await supabase
        .from("follows")
        .select("author_id")
        .eq("user_id", session.user.id);
      if (error) return [];
      return (data ?? []).map((r) => r.author_id);
    },
  });

  const followedSet = useMemo(
    () => new Set(followedAuthorIds),
    [followedAuthorIds]
  );

  const {
    data: infiniteData,
    isLoading: articlesLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["editorial-feed", "sort-processed-date"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const fetchArticles = async (): Promise<ArticleWithAuthorId[]> => {
        const rows = await fetchCompletedEditorialsPage(supabase, {
          limit: EDITORIAL_FEED_PAGE_SIZE,
          offset: pageParam,
        });
        return (rows ?? []) as ArticleWithAuthorId[];
      };

      return Promise.race([
        fetchArticles(),
        rejectAfter(25_000, "Could not load articles. Check network and EXPO_PUBLIC_SUPABASE_* in .env."),
      ]);
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < EDITORIAL_FEED_PAGE_SIZE
        ? undefined
        : lastPageParam + EDITORIAL_FEED_PAGE_SIZE,
  });

  const articles = useMemo(
    () => infiniteData?.pages.flat() ?? [],
    [infiniteData?.pages]
  );

  /** True when every row is from an older batch (none match today’s local calendar date). */
  const isShowingRecentFallback = useMemo(() => {
    if (!articles?.length) return false;
    return !articles.some((a) => a.processed_date === todayLocal);
  }, [articles, todayLocal]);

  const followingArticles = useMemo(() => {
    if (!articles) return [];
    return articles.filter((a) => a.author_id && followedSet.has(a.author_id));
  }, [articles, followedSet]);

  const baseDisplayArticles =
    segment === "all" ? articles ?? [] : followingArticles;
  const displayArticles = useMemo(() => {
    if (!searchQuery.trim()) return baseDisplayArticles;
    return baseDisplayArticles.filter((a) =>
      articleMatchesSearch(a, searchQuery)
    );
  }, [baseDisplayArticles, searchQuery]);
  const listEmpty = displayArticles.length === 0;

  const handleReadFull = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ArticleWithSource }) => (
      <SummaryCard
        item={item}
        onReadFull={handleReadFull}
        isBookmarked={isBookmarked(item.id)}
        onToggleBookmark={() => toggleBookmark(item.id)}
        onShare={async () => {
          const longUrl = editorialCanonicalUrl(item.id);
          const shareUrl = await shortenUrlForShare(longUrl);
          const message =
            [item.title, item.ai_summary ?? "", shareUrl].filter(Boolean).join("\n\n") || shareUrl;
          Share.share({ title: item.title, message, url: shareUrl });
        }}
      />
    ),
    [handleReadFull, isBookmarked, toggleBookmark]
  );

  const keyExtractor = useCallback((item: ArticleWithSource) => item.id, []);

  if (articlesLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading today's edition...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load articles. Please try again.";
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>
            Today's Edition
          </Text>
          <Text style={styles.headerDate}>{formatDisplayDate()}</Text>
          {isShowingRecentFallback ? (
            <Text style={styles.fallbackHint}>
              Showing latest editorials from your archive (nothing dated for today yet).
            </Text>
          ) : null}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setIsSearchOpen((prev) => !prev)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.savedLinkPressed,
            ]}
          >
            <Search size={22} color="#0f172a" strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/saved")}
            hitSlop={8}
            style={({ pressed }) => [
              styles.savedLink,
              pressed && styles.savedLinkPressed,
            ]}
          >
            <Text style={styles.savedLinkText}>Saved</Text>
          </Pressable>
        </View>
      </View>

      {isSearchOpen && (
        <View style={styles.searchBarWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or summary..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => {
              setSearchQuery("");
              setIsSearchOpen(false);
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.searchCloseBtn,
              pressed && styles.savedLinkPressed,
            ]}
          >
            <X size={20} color="#64748b" />
          </Pressable>
        </View>
      )}

      <View style={styles.segmentedContainer}>
        <SegmentedControl value={segment} onChange={setSegment} />
      </View>

      {listEmpty ? (
        searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
              No articles match "{searchQuery.trim()}"
            </Text>
            <Text style={styles.emptySubtitle}>
              Try different keywords in title or summary.
            </Text>
          </View>
        ) : segment === "all" ? (
          <EmptyStateAll />
        ) : (
          <EmptyStateFollowing />
        )
      ) : (
        <FlatList
          data={displayArticles}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.25}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.listFooterLoading}>
                <ActivityIndicator size="small" color="#0f172a" />
              </View>
            ) : null
          }
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
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  savedLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  savedLinkPressed: { opacity: 0.7 },
  savedLinkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0f172a",
  },
  headerDate: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
  },
  fallbackHint: {
    marginTop: 6,
    fontSize: 13,
    color: "#94a3b8",
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#0f172a",
  },
  searchCloseBtn: {
    padding: 8,
  },
  segmentedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  segmentedWrap: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748b",
  },
  segmentTextActive: {
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
  errorContainer: {
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
    paddingBottom: 32,
    paddingTop: 8,
  },
  listFooterLoading: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
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
  morningCoffeeIllustration: {
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  coffeeIconWrap: {
    padding: 20,
    borderRadius: 9999,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
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
  discoverButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  discoverButtonPressed: { opacity: 0.85 },
  discoverButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
