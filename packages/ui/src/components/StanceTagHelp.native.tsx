import * as Haptics from "expo-haptics";
import type { AuthorStance } from "@nonews/shared";
import {
  getStanceDescription,
  STANCE_DESCRIPTIONS,
  STANCE_TAG_HELP_INTRO,
  STANCES_ORDERED,
} from "@nonews/shared";
import { RotateCcw } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface StanceTagHelpPanelProps {
  stance: AuthorStance | null;
  onBack: () => void;
}

/** Back face copy for stance tags (used inside flip cards). */
export function StanceTagHelpPanel({ stance, onBack }: StanceTagHelpPanelProps) {
  const currentLabel = stance ?? "Unlabeled";

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  return (
    <View style={panelStyles.wrap}>
      <Text style={panelStyles.sheetTitle}>What this tag means</Text>
      <ScrollView
        style={panelStyles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <Text style={panelStyles.intro}>{STANCE_TAG_HELP_INTRO}</Text>
        <Text style={panelStyles.sectionLabel}>This article</Text>
        <Text style={panelStyles.currentLine}>
          <Text style={panelStyles.currentName}>{currentLabel}</Text>
          {" — "}
          {getStanceDescription(stance)}
        </Text>
        <Text style={panelStyles.sectionLabel}>All tags</Text>
        {STANCES_ORDERED.map((key) => (
          <Text key={key} style={panelStyles.bulletLine}>
            <Text style={panelStyles.bulletName}>{key}</Text>
            {" — "}
            {STANCE_DESCRIPTIONS[key]}
          </Text>
        ))}
      </ScrollView>
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [
          panelStyles.backButton,
          pressed && panelStyles.backButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Back to article"
      >
        <RotateCcw size={18} color="#fff" />
        <Text style={panelStyles.backButtonText}>Back to article</Text>
      </Pressable>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  wrap: { flex: 1, flexDirection: "column" },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
    fontFamily: "Georgia",
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: 16,
    maxHeight: 420,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  currentLine: {
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
    marginBottom: 14,
  },
  currentName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  bulletLine: {
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
    marginBottom: 10,
  },
  bulletName: {
    fontWeight: "600",
    color: "#0f172a",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#0f172a",
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
