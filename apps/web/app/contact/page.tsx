import type { Metadata } from "next";
import { APP_NAME, CONTACT_PAGE_URL, SITE_URL, SUPPORT_EMAIL } from "@nonews/shared";
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
    <main className="mx-auto max-w-4xl px-4 py-12">
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
          Use this page to contact the {APP_NAME} team about editorials, publisher concerns,
          support, privacy, or product feedback.
        </p>
      </header>

      <section
        aria-labelledby="contact-information"
        className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6"
      >
        <div className="max-w-2xl">
          <p
            id="contact-information"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500"
          >
            Contact Information
          </p>
          <h2
            className="mt-3 text-2xl font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Public support details for NoNews
          </h2>
          <p
            className="mt-3 text-base leading-relaxed text-slate-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            If you need help with the app, want to discuss a source or summary, or represent a
            publisher and need to reach us directly, use the contact details below.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Support email
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 block text-base font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Website
            </p>
            <a
              href={SITE_URL}
              className="mt-2 block text-base font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
            >
              {SITE_URL.replace(/^https?:\/\//, "")}
            </a>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Support page
            </p>
            <a
              href={CONTACT_PAGE_URL}
              className="mt-2 block text-base font-medium text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
            >
              {CONTACT_PAGE_URL.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
      </section>

      <section aria-label="Contact form">
        <ContactFormClient />
      </section>
    </main>
  );
}
