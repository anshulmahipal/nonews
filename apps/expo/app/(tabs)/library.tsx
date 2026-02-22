import { useBookmarks } from "../../hooks/useBookmarks";
import { supabase } from "../../lib/supabase";
import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Bookmark, Folder, FolderPlus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookmarkFolder {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface BookmarkWithArticle {
  article_id: string;
  folder_id: string | null;
  articles: ArticleWithSource | null;
}

const ALL_FOLDER_ID = "__all__";

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Bookmark size={64} color="#cbd5e1" strokeWidth={1.5} />
      </View>
      <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
        No saved editorials yet.
      </Text>
      <Text style={styles.emptySubtitle}>
        Start building your library!
      </Text>
    </View>
  );
}

function FolderChip({
  folder,
  isSelected,
  onPress,
}: {
  folder: BookmarkFolder;
  isSelected: boolean;
  onPress: () => void;
}) {
  const isAll = folder.id === ALL_FOLDER_ID;
  const tintColor = isAll ? "#64748b" : folder.color;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.folderChip,
        isSelected && styles.folderChipSelected,
        isSelected && { borderColor: tintColor, backgroundColor: `${tintColor}15` },
        pressed && styles.folderChipPressed,
      ]}
    >
      <Folder size={18} color={tintColor} strokeWidth={2} />
      <Text
        style={[
          styles.folderChipText,
          isSelected && styles.folderChipTextSelected,
          isSelected && { color: tintColor },
        ]}
      >
        {folder.name} ({folder.count})
      </Text>
    </Pressable>
  );
}

const DEFAULT_FOLDER_COLORS = ["#64748b", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"];

function NewFolderInput({
  onSubmit,
  onCancel,
  inputRef,
  autoFocus,
}: {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  inputRef: React.RefObject<TextInput | null>;
  autoFocus: boolean;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(id);
  }, [autoFocus, inputRef]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setName("");
    } else {
      onCancel();
    }
  };

  return (
    <View style={styles.newFolderInputWrap}>
      <TextInput
        ref={inputRef}
        style={styles.newFolderInput}
        placeholder="Folder name"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleSubmit}
        onBlur={handleSubmit}
        returnKeyType="done"
        autoCapitalize="words"
        autoCorrect={false}
        selectTextOnFocus
      />
    </View>
  );
}

export default function LibraryTab() {
  const queryClient = useQueryClient();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [selectedFolderId, setSelectedFolderId] = useState<string>(ALL_FOLDER_ID);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const newFolderInputRef = useRef<TextInput>(null);
  const foldersScrollRef = useRef<ScrollView>(null);

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");
      const color =
        DEFAULT_FOLDER_COLORS[
          Math.floor(Math.random() * DEFAULT_FOLDER_COLORS.length)
        ];
      const { data, error } = await supabase
        .from("bookmark_folders")
        .insert({ user_id: session.user.id, name, color })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmark-folders"] });
      setSelectedFolderId(data.id);
      setIsCreatingFolder(false);
    },
  });

  const handleNewFolderSubmit = useCallback(
    (name: string) => {
      createFolderMutation.mutate(name);
    },
    [createFolderMutation]
  );

  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ["bookmark-folders"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error: fetchError } = await supabase
        .from("bookmarks")
        .select(
          `
          article_id,
          folder_id,
          articles (
            id,
            title,
            link,
            author,
            published_at,
            ai_summary,
            ai_simplified_summary,
            ai_stance,
            sources (name)
          )
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      return (data ?? []) as BookmarkWithArticle[];
    },
  });

  const foldersWithCounts = useMemo((): BookmarkFolder[] => {
    const rows = bookmarkRows ?? [];
    const countByFolder = new Map<string, number>();
    let total = 0;

    for (const row of rows) {
      const article = row.articles;
      if (!article) continue;
      total++;
      const fid = row.folder_id ?? "__uncategorized__";
      countByFolder.set(fid, (countByFolder.get(fid) ?? 0) + 1);
    }

    const result: BookmarkFolder[] = [
      { id: ALL_FOLDER_ID, name: "All", color: "#64748b", count: total },
    ];

    for (const f of folders ?? []) {
      result.push({
        id: f.id,
        name: f.name,
        color: f.color,
        count: countByFolder.get(f.id) ?? 0,
      });
    }

    const uncategorizedCount = countByFolder.get("__uncategorized__") ?? 0;
    if (uncategorizedCount > 0) {
      result.push({
        id: "__uncategorized__",
        name: "Uncategorized",
        color: "#94a3b8",
        count: uncategorizedCount,
      });
    }

    return result;
  }, [bookmarkRows, folders]);

  const filteredArticles = useMemo(() => {
    const rows = bookmarkRows ?? [];
    const articles = rows
      .map((r) => r.articles)
      .filter((a): a is ArticleWithSource => a != null);

    if (selectedFolderId === ALL_FOLDER_ID) return articles;
    if (selectedFolderId === "__uncategorized__") {
      return rows
        .filter((r) => !r.folder_id)
        .map((r) => r.articles)
        .filter((a): a is ArticleWithSource => a != null);
    }
    return rows
      .filter((r) => r.folder_id === selectedFolderId)
      .map((r) => r.articles)
      .filter((a): a is ArticleWithSource => a != null);
  }, [bookmarkRows, selectedFolderId]);

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
        onShare={() => {
          const message = [item.title, item.ai_summary ?? "", item.link].filter(Boolean).join("\n\n") || item.link;
          Share.share({ title: item.title, message, url: item.link });
        }}
        onExplainRequested={async (articleId) => {
          const { data, error } = await supabase.functions.invoke("simplify-summary", {
            body: { articleId },
          });
          if (error) return null;
          return (data?.simplified as string) ?? null;
        }}
      />
    ),
    [handleReadFull, isBookmarked, toggleBookmark]
  );

  const keyExtractor = useCallback((item: ArticleWithSource) => item.id, []);

  const isLoading = foldersLoading || bookmarksLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const listEmpty = filteredArticles.length === 0;
  const hasAnyBookmarks = (bookmarkRows ?? []).some((r) => r.articles != null);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>
            Library
          </Text>
          <Text style={styles.headerSubtitle}>
            Your saved editorials by folder
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/")}
          hitSlop={8}
          style={({ pressed }) => [
            styles.navLink,
            pressed && styles.navLinkPressed,
          ]}
        >
          <Text style={styles.navLinkText}>Home</Text>
        </Pressable>
      </View>

      {foldersWithCounts.length > 0 && (
        <View style={styles.foldersSection}>
          <ScrollView
            ref={foldersScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foldersScroll}
          >
            {foldersWithCounts.map((folder) => (
              <FolderChip
                key={folder.id}
                folder={folder}
                isSelected={selectedFolderId === folder.id}
                onPress={() => setSelectedFolderId(folder.id)}
              />
            ))}
            {isCreatingFolder ? (
              <NewFolderInput
                onSubmit={handleNewFolderSubmit}
                onCancel={() => setIsCreatingFolder(false)}
                inputRef={newFolderInputRef}
                autoFocus
              />
            ) : (
              <Pressable
                onPress={() => {
                  setIsCreatingFolder(true);
                  setTimeout(() => foldersScrollRef.current?.scrollToEnd({ animated: true }), 150);
                }}
                style={({ pressed }) => [
                  styles.folderChip,
                  styles.newFolderChip,
                  pressed && styles.folderChipPressed,
                ]}
              >
                <FolderPlus size={18} color="#64748b" strokeWidth={2} />
                <Text style={styles.newFolderChipText}>New Folder</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      )}

      {!hasAnyBookmarks ? (
        <EmptyState />
      ) : listEmpty ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { fontFamily: "Georgia" }]}>
            No articles in this folder.
          </Text>
          <Text style={styles.emptySubtitle}>
            Bookmark articles to add them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
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
    paddingBottom: 8,
  },
  navLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navLinkPressed: { opacity: 0.7 },
  navLinkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
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
  foldersSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  foldersScroll: {
    paddingHorizontal: 16,
    paddingRight: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  folderChip: {
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  folderChipSelected: {
    borderWidth: 1.5,
  },
  folderChipPressed: { opacity: 0.8 },
  folderChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  folderChipTextSelected: {
    fontWeight: "600",
  },
  newFolderChip: {
    borderStyle: "dashed",
  },
  newFolderChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  newFolderInputWrap: {
    marginRight: 10,
    minWidth: 140,
  },
  newFolderInput: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#0f172a",
    backgroundColor: "#fff",
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
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
});
