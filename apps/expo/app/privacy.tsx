import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

export default function PrivacyScreen() {
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
          Privacy Policy
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: February 2025</Text>

        <Text style={styles.paragraph}>
          Editorial Quick Read (“we”, “our”, or “the App”) acts as a <Text style={styles.bold}>Data Fiduciary</Text> under the Digital Personal Data Protection Act, 2023 (DPDP Act), India. We are committed to protecting your privacy and processing your personal data only in a lawful, fair, and transparent manner. This Privacy Policy explains how we collect, use, store, and disclose your information. By using the App, you (“Data Principal”) consent to the practices described here. If you do not agree, please do not use the App.
        </Text>

        <Text style={styles.heading}>1. Consent-Based Collection</Text>
        <Text style={styles.paragraph}>
          We collect personal data only on the basis of your <Text style={styles.bold}>consent</Text>. We do not collect or process your personal data for any purpose without a clear, specific consent or another lawful ground under the DPDP Act.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Social Auth (Account data):</Text> When you sign in via Social Auth (e.g. Google or Apple), you consent to our receiving your <Text style={styles.bold}>email address</Text> and <Text style={styles.bold}>name</Text> from the identity provider. We use this data only to create and manage your account and to personalise your experience (e.g. Morning Brief, saved articles, preferences). We do not collect additional personal data beyond what you authorise through the chosen social login.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Push notifications:</Text> If you opt in to push notifications, we use a device token to deliver the Morning Brief and related notifications. You may withdraw this consent at any time via your device settings or in-app preferences.
        </Text>
        <Text style={styles.paragraph}>
          You may withdraw your consent at any time. Withdrawal will not affect the lawfulness of processing based on consent before its withdrawal. See Section 4 (Your Rights, Including Erasure) for how to withdraw consent and request erasure.
        </Text>

        <Text style={styles.heading}>2. Purpose and Use of Data</Text>
        <Text style={styles.paragraph}>
          We process your personal data only for the following specified purposes:
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Morning Brief and content delivery:</Text> To deliver your daily editorial summary and personalised content.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Push notifications:</Text> To send the Morning Brief and relevant updates when you have opted in.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Account and personalisation:</Text> To maintain your account and sync your preferences (e.g. bookmarks).
        </Text>
        <Text style={styles.paragraph}>
          We do not use your data for purposes other than those stated. We do not sell your personal data. We do not use your data for targeted advertising.
        </Text>

        <Text style={styles.heading}>3. Data Minimization and Accuracy</Text>
        <Text style={styles.paragraph}>
          We collect only the personal data that is necessary for the specified purposes (data minimization). We take reasonable steps to ensure that personal data we process is accurate and up to date when it is used.
        </Text>

        <Text style={styles.heading}>4. Your Rights Under the DPDP Act (Including Erasure)</Text>
        <Text style={styles.paragraph}>
          As a Data Principal under the Digital Personal Data Protection Act, 2023 (India), you have the following rights. We will give effect to these rights in accordance with the Act and applicable rules.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Right to withdraw consent:</Text> You may withdraw your consent at any time, with comparable ease to how you gave it. Upon withdrawal, we will cease processing your personal data for the purposes that were consent-based, unless we have another lawful ground to retain or process it.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Logout:</Text> In the App, go to Profile → Logout. This signs you out. Your account and data remain stored until you request erasure (deletion).
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Right to erasure (account deletion):</Text> You have the right to request erasure of your personal data. We will erase your personal data upon receipt of a valid request, unless retention is necessary for the specified purpose for which the data was collected or is required by any law for the time being in force.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>How to request erasure:</Text> In the App, go to Profile → Delete Profile (or the equivalent account deletion option). Alternatively, contact us using the details provided in the App or on our website and state that you wish to “delete my account” or “erase my personal data”. We will process your request within the timelines prescribed under the DPDP Act and applicable rules, and will confirm once your data has been erased.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Right to access and correction:</Text> You may request a summary of the personal data we process, the purposes of processing, and the identities of recipients (where applicable). You may also request correction, completion, or updating of inaccurate or incomplete data. Contact us using the details in the App or on our website.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Grievance redressal:</Text> If you are not satisfied with our response, you have the right to approach the Data Protection Board of India in accordance with the DPDP Act.
        </Text>

        <Text style={styles.heading}>5. Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We may share your information only with: (a) service providers (processors) who assist us in operating the App (e.g. hosting, authentication), under contractual obligations consistent with the DPDP Act; (b) law enforcement or regulatory bodies when required by law or to protect our rights and safety; and (c) in connection with a merger, sale, or restructuring of our business, with appropriate notice where required. We do not sell or rent your personal data.
        </Text>

        <Text style={styles.heading}>6. Data Retention and Security</Text>
        <Text style={styles.paragraph}>
          We retain your personal data only for as long as necessary to fulfil the specified purposes or as required by law. When you request erasure and no legal exception applies, we will erase or anonymise your data within the period required under the DPDP Act and applicable rules. We implement reasonable technical and organisational measures to protect your data against unauthorised access, alteration, or loss. No method of transmission or storage is completely secure; we cannot guarantee absolute security.
        </Text>

        <Text style={styles.heading}>7. Children</Text>
        <Text style={styles.paragraph}>
          The App is not directed at children under the age of 18. We do not knowingly collect personal data from children. If you believe we have collected such data, please contact us and we will take steps to erase it in accordance with our obligations.
        </Text>

        <Text style={styles.heading}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy in the App or by other reasonable means. Your continued use of the App after the effective date of changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically.
        </Text>

        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, your rights, or our data practices, please contact us through the contact details provided in the App or on our website.
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
