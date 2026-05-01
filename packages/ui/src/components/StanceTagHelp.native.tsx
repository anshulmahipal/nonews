import * as Haptics from "expo-haptics";
import type { AuthorStance } from "@nonews/shared";
import { getStanceDescription } from "@nonews/shared";
import { Info } from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface StanceTagTooltipButtonProps {
  stance: AuthorStance | null;
}

/** Opens a compact tooltip-style sheet with this article’s tag meaning only. */
export function StanceTagTooltipButton({ stance }: StanceTagTooltipButtonProps) {
  const [open, setOpen] = useState(false);
  const label = stance ?? "Unlabeled";
  const description = getStanceDescription(stance);

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`What does the ${label} tag mean?`}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        <Info size={18} color="#64748b" />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={styles.bubble} accessibilityViewIsModal>
            <Text style={styles.bubbleLabel}>{label}</Text>
            <Text style={styles.bubbleBody}>{description}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  bubble: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 18,
    paddingVertical: 16,
    maxWidth: 340,
    alignSelf: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  bubbleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
    fontFamily: "Georgia",
  },
  bubbleBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
});
