import { createSupabaseClient } from "@nonews/shared";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const hasShared = typeof createSupabaseClient === "function";
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editorial Quick Read</Text>
      <Text style={styles.subtitle}>
        Shared package: {hasShared ? "✓ resolved" : "✗ not found"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
});
