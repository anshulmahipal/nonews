import { useBookmarks } from "../../hooks/useBookmarks";
import { supabase } from "../../lib/supabase";
import { editorialCanonicalUrl, shortenUrlForShare } from "@nonews/shared";
import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Share2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = typeof id === "string" ? id : id?.[0];
  const { toggleBookmark, isBookmarked } = useBookmarks();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", articleId],
    queryFn: async () => {
      if (!articleId) throw new Error("No article ID");
      const { data, error: fetchError } = await supabase
        .from("articles")
        .select("id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources(name)")
        .eq("id", articleId)
        .single();

      if (fetchError) throw fetchError;
      return data as ArticleWithSource;
    },
    enabled: !!articleId,
  });

  const handleReadFull = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (!article) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const longUrl = editorialCanonicalUrl(article.id);
    const shareUrl = await shortenUrlForShare(longUrl);
    const message =
      [article.title, article.ai_summary ?? "", shareUrl].filter(Boolean).join("\n\n") || shareUrl;
    Share.share({
      title: article.title,
      message,
      url: shareUrl,
    });
  }, [article]);

  const [copyFeedback, setCopyFeedback] = useState(false);
  const handleCopyAppLink = useCallback(async () => {
    if (!articleId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const deepLink = `editorialapp://article/${articleId}`;
    await Clipboard.setStringAsync(deepLink);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }, [articleId]);

  if (!articleId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Invalid article link.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Article not found. It may have been removed.
          </Text>
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
        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Share2 size={18} color="#0f172a" />
            <Text style={styles.actionButtonText}>Share</Text>
          </Pressable>
          <Pressable
            onPress={handleCopyAppLink}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.actionButtonText}>
              {copyFeedback ? "Copied!" : "Copy app link"}
            </Text>
          </Pressable>
        </View>
        {copyFeedback && (
          <Text style={styles.copyHint}>
            Paste in Safari (or Notes) and tap to test deep link.
          </Text>
        )}
        <SummaryCard
          item={article}
          onReadFull={handleReadFull}
          isBookmarked={isBookmarked(article.id)}
          onToggleBookmark={() => toggleBookmark(article.id)}
          onShare={async () => {
            const longUrl = editorialCanonicalUrl(article.id);
            const shareUrl = await shortenUrlForShare(longUrl);
            const message =
              [article.title, article.ai_summary ?? "", shareUrl].filter(Boolean).join("\n\n") || shareUrl;
            Share.share({ title: article.title, message, url: shareUrl });
          }}
        />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  errorText: {
    textAlign: "center",
    color: "#dc2626",
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  actionButtonPressed: { opacity: 0.8 },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
  },
  copyHint: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },
});
