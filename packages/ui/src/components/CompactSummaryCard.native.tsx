import * as Haptics from "expo-haptics";
import type { ArticleWithSource } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getStanceStylesNative } from "../utils/getStanceStyles";

interface CompactSummaryCardProps {
  item: ArticleWithSource;
  /** Called when the card is pressed (e.g. navigate to article). If not provided, tap toggles summary expansion. */
  onPress?: () => void;
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

/**
 * Compact card showing Title, Author, and Stance. Summary is hidden until tapped, then expands in place.
 */
export function CompactSummaryCard({ item, onPress }: CompactSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const author = item.author ?? "—";
  const { border } = getStanceStylesNative(item.ai_stance);
  const summaryText = item.ai_summary ?? "No summary available.";
  const hasSummary = (item.ai_summary?.length ?? 0) > 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
      return;
    }
    if (hasSummary) setExpanded((e) => !e);
  };

  return (
    <View style={[styles.card, { borderLeftColor: border, borderLeftWidth: 4 }]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.mainTap, pressed && styles.mainTapPressed]}
      >
        <View style={styles.headerRow}>
          <StanceBadge stance={item.ai_stance} />
          {hasSummary && !onPress ? (
            expanded ? (
              <ChevronUp size={18} color="#64748b" />
            ) : (
              <ChevronDown size={18} color="#64748b" />
            )
          ) : null}
        </View>
        <Text
          style={[styles.title, { fontFamily: "Georgia" }]}
          numberOfLines={expanded ? undefined : 2}
        >
          {item.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {author}
        </Text>
      </Pressable>
      {expanded && hasSummary && !onPress ? (
        <View style={styles.summaryBlock}>
          <Text style={[styles.summaryText, { fontFamily: "Georgia" }]}>
            {summaryText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainTap: {
    padding: 0,
  },
  mainTapPressed: { opacity: 0.9 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
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
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryBlock: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginTop: 12,
    paddingTop: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1e293b",
  },
});
