import * as Haptics from "expo-haptics";
import type { ArticleWithSource } from "../types";
import { ChevronDown, ChevronUp, Info } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StanceTagHelpPanel } from "./StanceTagHelp.native";
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

  const rotationY = useSharedValue(0);
  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${rotationY.value}deg` }],
  }));

  const flipToInfo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rotationY.value = withTiming(180, { duration: 450 });
  };

  const flipToArticle = () => {
    rotationY.value = withTiming(0, { duration: 450 });
  };

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
      <Animated.View style={[styles.flipInner, flipStyle]}>
        <View style={styles.faceFront}>
          <View style={styles.headerRow}>
            <View style={styles.stanceRow}>
              <StanceBadge stance={item.ai_stance} />
              <Pressable
                onPress={flipToInfo}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="What does this tag mean? Flip card to explain."
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <Info size={18} color="#64748b" />
              </Pressable>
            </View>
            {hasSummary && !onPress ? (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpanded((e) => !e);
                }}
                hitSlop={12}
                accessibilityLabel={
                  expanded ? "Collapse summary" : "Expand summary"
                }
              >
                {expanded ? (
                  <ChevronUp size={18} color="#64748b" />
                ) : (
                  <ChevronDown size={18} color="#64748b" />
                )}
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.mainTap,
              pressed && styles.mainTapPressed,
            ]}
          >
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
        <View style={styles.faceBack}>
          <StanceTagHelpPanel stance={item.ai_stance} onBack={flipToArticle} />
        </View>
      </Animated.View>
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
  flipInner: {
    position: "relative",
    width: "100%",
  },
  faceFront: {
    position: "relative",
    width: "100%",
    backfaceVisibility: "hidden",
  },
  faceBack: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    backfaceVisibility: "hidden",
    transform: [{ rotateY: "180deg" }],
    flexDirection: "column",
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
  stanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
