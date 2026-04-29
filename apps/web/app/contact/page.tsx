import type { Metadata } from "next";
import { ContactFormClient } from "./ContactFormClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with NoNews. Send feedback, questions, or ideas—we read every message. nonews.in",
};

/**
 * Public contact page; form submissions are stored in Supabase `public.feedback`.
 */
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-10">
        <h1
          className="text-3xl font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Contact
        </h1>
        <p
          className="mt-3 text-lg leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          We are building NoNews in public. Tell us what is working, what is not, and what you
          would like to see next.
        </p>
      </header>

      <section aria-label="Contact form">
        <ContactFormClient />
      </section>
    </main>
  );
}
