import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useEffect, useState } from "react";
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

const SUPPORT_EMAIL = "hello@nonews.in";

const emailFormatOk = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactUsScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const submitting = formStatus === "sending";

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      return s;
    },
  });

  const isLoggedIn = Boolean(session?.user);
  const accountEmail = session?.user?.email?.trim() ?? "";

  useEffect(() => {
    if (accountEmail) {
      setEmail((prev) => (prev.trim() ? prev : accountEmail));
    }
  }, [accountEmail]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      Alert.alert("Missing field", "Please enter your name.");
      return;
    }

    const replyEmail = (trimmedEmail || accountEmail).trim();
    if (!isLoggedIn) {
      if (!trimmedEmail) {
        Alert.alert(
          "Email required",
          "We need your email to reply, or you can sign in to use your account email.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign in", onPress: () => router.push("/login") },
          ],
        );
        return;
      }
      if (!emailFormatOk(trimmedEmail)) {
        setErrorText("Please enter a valid email address.");
        return;
      }
    } else if (replyEmail && !emailFormatOk(replyEmail)) {
      setErrorText("Please enter a valid email address.");
      return;
    } else if (!replyEmail) {
      setErrorText("Please add an email so we can reply.");
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

    setErrorText(null);
    setFormStatus("sending");
    try {
      const { error } = await supabase.from("feedback").insert({
        name: trimmedName,
        email: replyEmail || null,
        subject: trimmedSubject,
        message: trimmedMessage,
        user_id: session?.user?.id ?? null,
      });

      if (error) throw error;

      setName("");
      setEmail(accountEmail);
      setSubject("");
      setMessage("");
      setFormStatus("success");
      if (Platform.OS !== "web") {
        Alert.alert("Message sent", "Thanks for getting in touch. We'll respond as soon as we can.");
      }
    } catch (e) {
      const msg =
        e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.";
      setErrorText(msg);
      setFormStatus("error");
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
          {formStatus === "success" ? (
            <View
              style={styles.successCard}
              accessibilityRole="text"
              accessibilityLabel="Message sent. Thank you."
            >
              <Text style={styles.successTitle}>Thank you</Text>
              <Text style={styles.successBody}>
                We received your message and will get back to you as soon as we can.
              </Text>
              <Pressable
                onPress={() => {
                  setFormStatus("idle");
                  setErrorText(null);
                  setEmail(accountEmail);
                }}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.submitPressed]}
              >
                <Text style={styles.secondaryButtonText}>Send another message</Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.textLink, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.textLinkText}>Back</Text>
              </Pressable>
            </View>
          ) : null}

          {formStatus === "success" ? null : (
          <>
          <Text style={styles.intro}>
            Reach us at{" "}
            <Text style={styles.introEmail} onPress={handleEmailSupport}>
              {SUPPORT_EMAIL}
            </Text>
            {" "}or send a message below.
          </Text>
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
            <Text style={[styles.label, styles.labelTop]}>
              Email{isLoggedIn ? "" : " (required)"}
            </Text>
            {isLoggedIn && accountEmail ? (
              <Text style={styles.helperText}>From your account — you can change it for this message.</Text>
            ) : !isLoggedIn ? (
              <Text style={styles.helperText}>
                We need an email to reply, or use Sign in on your profile to use your account.
              </Text>
            ) : null}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
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
            {errorText ? (
              <Text style={styles.errorText} accessibilityRole="alert">
                {errorText}
              </Text>
            ) : null}
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
          </>
          )}

          {formStatus === "success" ? null : (
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Quick Actions</Text>
            <Pressable
              onPress={handleEmailSupport}
              style={({ pressed }) => [styles.quickButton, pressed && styles.quickPressed]}
            >
              <Mail size={20} color="#0f172a" strokeWidth={2} />
              <View style={styles.quickButtonText}>
                <Text style={styles.quickLabel}>Email support</Text>
                <Text style={styles.quickEmail}>{SUPPORT_EMAIL}</Text>
              </View>
            </Pressable>
          </View>
          )}
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
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 16,
    fontFamily: "Georgia",
  },
  introEmail: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    textDecorationLine: "underline",
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
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    marginBottom: 8,
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
  quickButtonText: {
    flex: 1,
    gap: 2,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  quickEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  successCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    padding: 24,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#064e3b",
    textAlign: "center",
  },
  successBody: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: "#047857",
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
  },
  textLink: {
    marginTop: 16,
    alignItems: "center",
  },
  textLinkText: {
    fontSize: 15,
    color: "#047857",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#b91c1c",
  },
});
