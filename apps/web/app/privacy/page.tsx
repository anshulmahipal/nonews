import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How NoNews collects, uses, and protects your information. AI summarization, Supabase auth, and your choices. nonews.in",
};

/**
 * Privacy policy copy for the NoNews web app (editorial summaries, Supabase, Gemini).
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-10">
        <h1
          className="text-3xl font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Privacy Policy
        </h1>
        <p
          className="mt-3 text-lg leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          We built NoNews to respect your attention and your data. This page explains what we
          collect, why we collect it, and how you can exercise your choices.
        </p>
        <p
          className="mt-4 text-sm text-slate-500"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Last updated: April 2026
        </p>
      </header>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Who we are
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          <strong className="font-semibold text-slate-800">NoNews</strong> (&quot;we,&quot; &quot;us&quot;)
          publishes concise summaries of editorials at{" "}
          <span className="whitespace-nowrap">nonews.in</span> and related services. We summarize
          third-party articles to help you stay informed; we do not replace the original
          publications. For how we use AI, see also our{" "}
          <Link href="/about#ai-ethics" className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            AI &amp; Ethics
          </Link>{" "}
          section on the About page.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Information we collect
        </h2>
        <ul
          className="list-disc space-y-3 pl-5 leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <li>
            <strong className="font-semibold text-slate-800">Account and profile.</strong> If you
            sign in, we process identifiers such as your email address and a user ID provided by
            our authentication service. You may also save preferences (for example, authors or
            topics you follow) that are tied to your account.
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Usage of the service.</strong> We may
            collect technical and usage data needed to run the app—for example device or browser
            type, approximate region (via IP where applicable), and interactions with pages or
            features. This helps us keep the product reliable and understand what readers value.
          </li>
          <li>
            <strong className="font-semibold text-slate-800">Content you see.</strong> We log
            server-side activity required to deliver summaries, links to sources, and
            personalization you have opted into. We do not sell your personal information.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          How we use information
        </h2>
        <p className="mb-3 leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          We use the data above to:
        </p>
        <ul
          className="list-disc space-y-2 pl-5 leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <li>Provide, secure, and improve NoNews (including sign-in, bookmarks, and following).</li>
          <li>Diagnose errors, prevent abuse, and comply with applicable law.</li>
          <li>Communicate service-related notices when necessary.</li>
        </ul>
      </section>

      <section id="ai-processing" className="mb-10 scroll-mt-6">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          AI and summarization
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          Summaries are produced using automated systems (including Google Gemini) from editorial
          text we have ingested from public sources.{" "}
          <strong className="font-semibold text-slate-800">
            That processing happens on our infrastructure, not on your device, for the purpose of
            generating briefs for all readers.
          </strong>{" "}
          We do not use your private messages to train third-party models unless we expressly say
          so in a separate notice. Original reporting and viewpoints remain with the source
          publications; each summary links to the full article.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Cookies and local storage
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          We use cookies and similar technologies that are necessary for the site to function (for
          example, to keep you signed in and to remember session preferences). You can control many
          cookies through your browser settings; disabling some of them may limit certain
          features.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Service providers
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          We rely on trusted vendors to host and operate NoNews. These may include, for example,
          database and authentication providers (such as Supabase), hosting and deployment platforms
          (such as Vercel), and AI inference providers (such as Google) used only as described
          here. They process data on our behalf under contractual safeguards appropriate to their
          role.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Retention and security
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          We keep personal information only as long as needed for the purposes above or as required
          by law. We use administrative, technical, and organizational measures designed to protect
          your data. No method of transmission over the internet is completely secure; we work to
          apply reasonable safeguards in line with the nature of our service.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Your choices
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          Depending on where you live, you may have rights to access, correct, delete, or export
          personal data we hold about you, or to object to or restrict certain processing. To
          exercise these rights, sign in and use in-product controls where available, or contact us
          using the details below. We may need to verify your identity before fulfilling a request.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Children
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          NoNews is not directed at children under 13 (or the age required by your jurisdiction),
          and we do not knowingly collect personal information from them. If you believe we have
          done so in error, please contact us and we will take appropriate steps.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          International transfers
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          Our infrastructure and partners may process data in countries other than where you live.
          Where required, we rely on appropriate safeguards for cross-border transfers.
        </p>
      </section>

      <section className="mb-10">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Changes to this policy
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          We may update this Privacy Policy from time to time. We will post the revised version on
          this page and adjust the &quot;Last updated&quot; date. For material changes, we will
          provide additional notice if the law requires it.
        </p>
      </section>

      <section className="mb-6">
        <h2
          className="mb-3 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Contact
        </h2>
        <p className="leading-relaxed text-slate-600" style={{ fontFamily: "Georgia, serif" }}>
          Questions about privacy at NoNews? Visit our{" "}
          <Link href="/about" className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600">
            About
          </Link>{" "}
          page for context on the product, or reach us on{" "}
          <a
            href="https://twitter.com/mr_mahipal2802"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
          >
            X (Twitter) @mr_mahipal2802
          </a>
          . For data-protection requests, include the email associated with your account so we
          can help you efficiently.
        </p>
      </section>

      <p
        className="text-sm italic text-slate-500"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Thank you for trusting NoNews with your time and attention.
      </p>
    </main>
  );
}
