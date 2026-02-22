import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

export default function TermsScreen() {
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
          Terms of Service
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: February 2025</Text>

        <Text style={styles.paragraph}>
          Welcome to Editorial Quick Read (“we”, “our”, or “the App”). By using this app, you agree to these Terms of Service. If you do not agree, please do not use the App.
        </Text>

        <Text style={styles.heading}>1. Description of Service</Text>
        <Text style={styles.paragraph}>
          Editorial Quick Read is a <Text style={styles.bold}>search and discovery</Text> tool that helps you find and engage with editorial content from third-party publishers. We provide short, AI-generated summaries of editorials to promote informed reading and intellectual discourse. We do not create the underlying news or editorial content; we aggregate, summarize, and link to it. All original content remains the property of the respective publishers. We always link back to the original publisher so you can read the full article in its original context.
        </Text>

        <Text style={styles.heading}>2. Fair Use</Text>
        <Text style={styles.paragraph}>
          Our use of third-party editorial content is intended to fall within principles of fair use (or analogous exceptions under applicable law). We use limited excerpts and summaries solely for the purpose of search, discovery, and enabling users to decide whether to access the full work. We do not reproduce full articles. We do not use such content for commercial exploitation of the original work. We attribute content to the source publisher and direct users to the original source for the complete, verbatim text. If you are a publisher and believe our use of your content does not qualify as fair use or otherwise infringes your rights, please contact us and we will address your concerns in good faith.
        </Text>

        <Text style={styles.heading}>3. Disclaimer — AI-Generated Summaries</Text>
        <Text style={styles.paragraph}>
          Summaries provided in the App are generated using automated (AI) systems. While we strive for accuracy and consistency, <Text style={styles.bold}>AI-generated summaries may occasionally vary in tone, emphasis, or wording from the original article.</Text> They are not a substitute for the source material. For verbatim accuracy, full context, and the author’s exact views, you should always refer to the original publisher’s article via the link we provide. We do not guarantee that summaries are error-free or that they reflect every nuance of the original. We are not liable for any reliance placed solely on summaries without consulting the source.
        </Text>

        <Text style={styles.heading}>4. Use of Content</Text>
        <Text style={styles.paragraph}>
          Summaries and metadata in the App are provided for personal, non-commercial use only. You may not reproduce, distribute, or create derivative works from our summaries or the App for commercial purposes without our permission. You must not remove or obscure attribution to source publishers. When you follow links to full articles, you are subject to the terms and policies of those third-party sites. We do not control and are not responsible for third-party content or sites.
        </Text>

        <Text style={styles.heading}>5. User Accounts and Data</Text>
        <Text style={styles.paragraph}>
          To use features such as bookmarks and personalised content (e.g. Morning Brief), you may need to create an account. You are responsible for keeping your account credentials secure. We process your data in accordance with our Privacy Policy and applicable law, including the Digital Personal Data Protection Act, 2023 (India). By using the App, you consent to such processing as described in our Privacy Policy.
        </Text>

        <Text style={styles.heading}>6. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree not to use the App to violate any law, infringe others’ rights, or transmit harmful or offensive content. You may not attempt to gain unauthorised access to our systems or other users’ accounts, or use automated means to scrape or overload the service beyond normal, personal use.
        </Text>

        <Text style={styles.heading}>7. Disclaimers</Text>
        <Text style={styles.paragraph}>
          The App and all content are provided “as is”. We do not guarantee the accuracy, completeness, or timeliness of summaries or sources. We are not liable for any decisions you make based on the content. We do not endorse the views expressed in linked articles or by third-party publishers. Your use of the App and any linked content is at your own risk.
        </Text>

        <Text style={styles.heading}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the fullest extent permitted by applicable law (including the Indian Contract Act, 1872), we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim, or one hundred Indian Rupees (₹100), whichever is lower.
        </Text>

        <Text style={styles.heading}>9. Changes and Termination</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms at any time. Continued use of the App after changes constitutes acceptance. We may suspend or terminate your access if you breach these Terms or for operational or legal reasons. You may stop using the App at any time and may request deletion of your account and data as set out in our Privacy Policy.
        </Text>

        <Text style={styles.heading}>10. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.
        </Text>

        <Text style={styles.paragraph}>
          If you have questions about these Terms, please contact us through the contact details provided in the App or on our website.
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  updated: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 24,
    marginBottom: 8,
    fontFamily: "Georgia",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    marginBottom: 12,
  },
  bold: {
    fontWeight: "600",
    color: "#0f172a",
  },
});
