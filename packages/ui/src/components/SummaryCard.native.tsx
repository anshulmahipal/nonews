import * as Haptics from "expo-haptics";
import type { ArticleWithSource } from "../types";
import { Bookmark, ExternalLink, Share2 } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { formatPublishedAt } from "../utils/formatPublishedAt";
import { getStanceStylesNative } from "../utils/getStanceStyles";

/** Domain from article link for favicon URL. */
function getDomain(link: string): string {
  try {
    return new URL(link).hostname;
  } catch {
    return "";
  }
}

interface SummaryCardProps {
  item: ArticleWithSource;
  onReadFull: (url: string) => void;
  /** Whether this article is bookmarked. Omit to hide bookmark button. */
  isBookmarked?: boolean;
  /** Called when user taps bookmark. Omit to hide bookmark button. */
  onToggleBookmark?: () => void;
  /** Called when user taps Share. If provided, shows Share button. */
  onShare?: () => void;
}

function StanceBadge({ stance }: { stance: ArticleWithSource["ai_stance"] }) {
  const label = stance ?? "Unknown";
  const { badge } = getStanceStylesNative(stance);
  return (
    <View style={[styles.stanceBadge, { backgroundColor: badge }]}>
      <Text style={styles.stanceBadgeText}>{label}</Text>
    </View>
  );
}

function BookmarkButton({
  isBookmarked,
  onToggle,
}: {
  isBookmarked: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scale.value = withSequence(
      withTiming(1.25, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
  }, [isBookmarked, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={12}
      style={({ pressed }) => [styles.bookmarkButton, pressed && styles.bookmarkButtonPressed]}
    >
      <Animated.View style={animatedStyle}>
        {isBookmarked ? (
          <Bookmark size={22} color="#0f172a" fill="#0f172a" strokeWidth={1.5} />
        ) : (
          <Bookmark size={22} color="#64748b" strokeWidth={2} />
        )}
      </Animated.View>
    </Pressable>
  );
}

export function SummaryCard({
  item,
  onReadFull,
  isBookmarked,
  onToggleBookmark,
  onShare,
}: SummaryCardProps) {
  const sourceName = item.sources?.name ?? "Unknown Source";
  const sourceDomain = getDomain(item.link);
  const faviconUrl = sourceDomain
    ? `https://www.google.com/s2/favicons?domain=${sourceDomain}&sz=32`
    : null;
  const author = item.author ?? "—";
  const { border } = getStanceStylesNative(item.ai_stance);
  const publishedLabel = item.published_at
    ? formatPublishedAt(item.published_at)
    : null;

  const handleReadFull = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReadFull(item.link);
  };

  const showBookmark = onToggleBookmark != null;

  const summaryText = item.ai_summary ?? "No summary available.";

  return (
    <View style={[styles.card, { borderLeftColor: border, borderLeftWidth: 4 }]}>
      <View style={styles.cardStanceWrap}>
        <StanceBadge stance={item.ai_stance} />
        {showBookmark && (
          <BookmarkButton
            isBookmarked={!!isBookmarked}
            onToggle={onToggleBookmark}
          />
        )}
      </View>
      <Text style={[styles.summaryText, { fontFamily: "Georgia" }]}>
        {summaryText}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.footerRow}>
          {faviconUrl ? (
            <Image
              source={{ uri: faviconUrl }}
              style={styles.sourceAvatar}
              accessibilityRole="image"
              accessibilityLabel=""
            />
          ) : null}
          <Text style={styles.footerText}>
            {sourceName} · {author}
            {publishedLabel ? ` · ${publishedLabel}` : ""}
          </Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleReadFull}
          style={({ pressed }) => [
            styles.readFullButton,
            pressed && styles.readFullButtonPressed,
          ]}
        >
          <ExternalLink size={16} color="#fff" />
          <Text style={styles.readFullText}>Read Full Article</Text>
        </Pressable>
        {onShare && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onShare();
            }}
            style={({ pressed }) => [
              styles.shareButton,
              pressed && styles.shareButtonPressed,
            ]}
          >
            <Share2 size={16} color="#475569" />
            <Text style={styles.shareButtonText}>Share</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardStanceWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  bookmarkButton: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  bookmarkButtonPressed: { opacity: 0.7 },
  stanceBadge: {
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stanceBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  summaryText: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#1e293b",
  },
  cardFooter: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sourceAvatar: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  footerText: { fontSize: 14, color: "#64748b", flex: 1 },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  readFullButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#0f172a",
  },
  readFullButtonPressed: { opacity: 0.8 },
  readFullText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  shareButtonPressed: { opacity: 0.8 },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
});
