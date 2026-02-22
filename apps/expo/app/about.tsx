import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Target, Sparkles } from "lucide-react-native";

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
        >
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontFamily: "Georgia" }]}>
          About
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Editorial Quick Read delivers concise, high-signal summaries of editorials so you can stay informed without the noise.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={22} color="#0f172a" strokeWidth={2} />
            <Text style={[styles.heading, { fontFamily: "Georgia" }]}>
              Our Mission
            </Text>
          </View>
          <Text style={styles.paragraph}>
            We exist to inform India&apos;s decision makers. Whether you lead in policy, business, or civil society, your time is scarce and the news cycle is relentless. We curate editorials from trusted publications and distill them into brief, scannable summaries—so you can grasp the argument, see the stance, and decide what deserves a deeper read.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles size={22} color="#0f172a" strokeWidth={2} />
            <Text style={[styles.heading, { fontFamily: "Georgia" }]}>
              AI &amp; Ethics
            </Text>
          </View>
          <Text style={styles.paragraph}>
            We use Google&apos;s Gemini to generate our summaries. The AI condenses long editorials into roughly 80-word briefs and surfaces the author&apos;s stance. Important: the original authorship, reporting, and views belong entirely to the source publications. We do not create the news—we summarize it. Every piece links back to the full article so you can read the original and form your own view.
          </Text>
        </View>

        <Text style={styles.footer}>
          Thank you for reading. Stay informed.
        </Text>
      </ScrollView>
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backPressed: { opacity: 0.7 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  lead: {
    fontSize: 17,
    lineHeight: 26,
    color: "#334155",
    marginBottom: 28,
    fontFamily: "Georgia",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
  },
  footer: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    fontStyle: "italic",
  },
});
