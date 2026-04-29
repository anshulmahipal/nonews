"use client";

import { createSupabaseClient } from "@nonews/shared";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const SUPPORT_EMAIL = "hello@nonews.in";

const emailFormatOk = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

function getSubmitError(
  authLoading: boolean,
  user: User | null,
  name: string,
  email: string,
  subject: string,
  message: string
): string | null {
  if (authLoading) {
    return "One moment while we check your sign-in…";
  }
  if (!name.trim()) {
    return "Please enter your name.";
  }
  if (!user && !email.trim()) {
    return "Please enter your email so we can reply.";
  }
  const replyEmail = email.trim() || user?.email?.trim() || "";
  if (!emailFormatOk(replyEmail)) {
    return "Please enter a valid email address.";
  }
  if (!subject.trim()) {
    return "Please enter a subject.";
  }
  if (!message.trim()) {
    return "Please enter your message.";
  }
  return null;
}

/**
 * Contact form: inserts into public.feedback (RLS: insert for anon + authenticated only).
 */
export function ContactFormClient() {
  const { user, isLoading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail((prev) => prev || user.email!);
    }
  }, [user]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    const validation = getSubmitError(
      authLoading,
      user,
      trimmedName,
      trimmedEmail,
      trimmedSubject,
      trimmedMessage
    );
    if (validation) {
      setErrorMessage(validation);
      return;
    }

    const replyEmail = trimmedEmail || user?.email?.trim() || "";

    setErrorMessage(null);
    setStatus("sending");

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("feedback").insert({
        name: trimmedName,
        email: replyEmail || null,
        subject: trimmedSubject,
        message: trimmedMessage,
        user_id: user?.id ?? null,
      });

      if (error) throw error;
      setStatus("success");
      setName("");
      setEmail(user?.email ?? "");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    }
  };

  const formDisabled = status === "sending" || authLoading;

  if (status === "success") {
    return (
      <div
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center"
        role="status"
      >
        <p
          className="text-lg font-medium text-emerald-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Thank you
        </p>
        <p
          className="mt-2 text-emerald-800/90"
          style={{ fontFamily: "Georgia, serif" }}
        >
          We received your message and will get back to you as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setErrorMessage(null);
          }}
          className="mt-6 text-sm font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2 transition hover:text-emerald-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <p className="text-sm text-slate-500" style={{ fontFamily: "Georgia, serif" }}>
        Questions, feedback, or ideas—write to us below, or email{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-slate-800 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-500"
        >
          {SUPPORT_EMAIL}
        </a>
        .
        {!authLoading && user ? (
          <span className="mt-2 block text-slate-400">
            Signed in as {user.email ?? "your account"} (we will attach this to your message).
          </span>
        ) : null}
      </p>

      <div>
        <label
          htmlFor="contact-name"
          className="mb-1.5 block text-sm font-medium text-slate-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          style={{ fontFamily: "Georgia, serif" }}
          disabled={formDisabled}
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1.5 block text-sm font-medium text-slate-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Email{user && user.email ? (
            <span className="font-normal text-slate-500"> (prefilled from your account)</span>
          ) : (
            <span className="font-normal text-slate-500"> (required to reply)</span>
          )}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          style={{ fontFamily: "Georgia, serif" }}
          disabled={formDisabled}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="mb-1.5 block text-sm font-medium text-slate-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          autoComplete="off"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          style={{ fontFamily: "Georgia, serif" }}
          disabled={formDisabled}
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-sm font-medium text-slate-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          style={{ fontFamily: "Georgia, serif" }}
          disabled={formDisabled}
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={formDisabled}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {authLoading
            ? "Loading…"
            : status === "sending"
              ? "Sending…"
              : "Send message"}
        </button>
        {status === "error" ? (
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
            }}
            className="text-sm text-slate-600 underline"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </form>
  );
}
