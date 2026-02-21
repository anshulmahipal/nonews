import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUPPORT_EMAIL = "support@editorialquickread.com";

export default function ContactUsScreen() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      return s;
    },
  });

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      Alert.alert("Missing field", "Please enter your name.");
      return;
    }
    if (!trimmedSubject) {
      Alert.alert("Missing field", "Please enter a subject.");
      return;
    }
    if (!trimmedMessage) {
      Alert.alert("Missing field", "Please enter your message.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        name: trimmedName,
        subject: trimmedSubject,
        message: trimmedMessage,
        user_id: session?.user?.id ?? null,
      });

      if (error) throw error;

      Alert.alert("Message sent", "Thanks for getting in touch. We'll respond as soon as we can.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setName("");
      setSubject("");
      setMessage("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

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
          Contact us
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              editable={!submitting}
            />
            <Text style={[styles.label, styles.labelTop]}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="What is this about?"
              placeholderTextColor="#94a3b8"
              editable={!submitting}
            />
            <Text style={[styles.label, styles.labelTop]}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Your message..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
            />
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitButton,
                submitting && styles.submitDisabled,
                pressed && !submitting && styles.submitPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Send message</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Quick Actions</Text>
            <Pressable
              onPress={handleEmailSupport}
              style={({ pressed }) => [styles.quickButton, pressed && styles.quickPressed]}
            >
              <Mail size={20} color="#0f172a" strokeWidth={2} />
              <Text style={styles.quickLabel}>Email Support</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  labelTop: {
    marginTop: 16,
  },
  input: {
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageInput: {
    minHeight: 100,
    paddingTop: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  quickSection: {
    marginBottom: 24,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  quickPressed: {
    opacity: 0.85,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
});
