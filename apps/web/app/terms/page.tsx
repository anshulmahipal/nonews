import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for NoNews (nonews.in): how we provide summaries and discovery, and what we do not promise. Read before using the site.",
};

/**
 * Terms of Service — informational discovery layer; strong disclaimers; no partnership with publishers.
 * Not a substitute for legal advice; a qualified lawyer should review before reliance.
 */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-10">
        <h1
          className="text-3xl font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-slate-500" style={{ fontFamily: "Georgia, serif" }}>
          Last updated: April 2026
        </p>
        <p
          className="mt-4 text-lg leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          NoNews (“we”, “us”) operates nonews.in and related services (the “Service”). These Terms explain
          what the Service is, what it is not, and how we intend to keep expectations modest for everyone
          who uses it—including readers and the publications we link to.
        </p>
      </header>

      <div className="space-y-10 text-slate-600 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
        <section aria-labelledby="t-accept">
          <h2 id="t-accept" className="mb-3 text-xl font-semibold text-slate-900">
            1. Agreement
          </h2>
          <p>
            By accessing or using the Service, you agree to these Terms. If you do not agree, please do not
            use the Service. We may update these Terms from time to time; the “Last updated” date above will
            change when we do. Continued use after changes means you accept the revised Terms.
          </p>
        </section>

        <section aria-labelledby="t-nature">
          <h2 id="t-nature" className="mb-3 text-xl font-semibold text-slate-900">
            2. What NoNews is
          </h2>
          <p>
            NoNews is a <strong className="font-semibold text-slate-800">discovery and reading aid</strong>.
            We surface short, machine-assisted summaries of editorials and metadata (such as titles,
            sources, and topics) to help you decide whether to read the full piece on the publisher’s site.
            We do not replace original journalism. Verbatim text, layout, and the publisher’s full argument
            appear only on the publisher’s properties, which we link to prominently.
          </p>
        </section>

        <section aria-labelledby="t-publishers">
          <h2 id="t-publishers" className="mb-3 text-xl font-semibold text-slate-900">
            3. Publishers and third-party content
          </h2>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">No contractual partnership.</strong> Nothing in
            these Terms creates a partnership, joint venture, agency, employment, or licensing relationship
            between NoNews and any publisher, author, or rights holder. Publishers are not “onboarding” onto
            NoNews and we do not speak for them.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Rights remain with the source.</strong> Articles,
            headlines, and opinions belong to their respective publishers and authors. Our summaries are
            ancillary text intended for indexing and discovery; they are not substitutes for the original
            work.
          </p>
          <p>
            <strong className="font-semibold text-slate-800">Concerns from rights holders.</strong> If you
            represent a publication and have questions about how we reference your work, please{" "}
            <Link href="/contact" className="text-slate-900 underline underline-offset-2 hover:text-slate-700">
              contact us
            </Link>
            . We handle good-faith requests promptly. Addressing a request does not mean we admit wrongdoing
            or waive any position under law.
          </p>
        </section>

        <section aria-labelledby="t-ai">
          <h2 id="t-ai" className="mb-3 text-xl font-semibold text-slate-900">
            4. AI-generated summaries and accuracy
          </h2>
          <p className="mb-3">
            Summaries are produced with automated tools. They may omit nuance, mis-emphasize a point, or
            occasionally contain errors.{" "}
            <strong className="font-semibold text-slate-800">
              They are not legal, financial, medical, or professional advice.
            </strong>{" "}
            For any decision that matters, read the original article and consult qualified professionals as
            needed.
          </p>
          <p>
            We do not guarantee that summaries are complete, timely, or error-free. Your reliance on any
            summary is solely at your discretion and risk.
          </p>
        </section>

        <section aria-labelledby="t-users">
          <h2 id="t-users" className="mb-3 text-xl font-semibold text-slate-900">
            5. Your use of the Service
          </h2>
          <p className="mb-3">
            We keep this section narrow. You agree to use the Service only in compliance with applicable law
            and in a way that does not harm the Service or other people—for example, you must not attempt to
            break security, overload our systems with abusive automated traffic, or use the Service to harass
            others or transmit unlawful material through any feature we provide.
          </p>
          <p>
            Beyond that, we do not impose membership fees, posting obligations, or editorial duties on you.
            Accounts or features we may add will describe any extra rules at the point of use.
          </p>
        </section>

        <section aria-labelledby="t-links">
          <h2 id="t-links" className="mb-3 text-xl font-semibold text-slate-900">
            6. Third-party sites and advertisements
          </h2>
          <p>
            Links leave our Service. Third-party sites have their own terms, privacy policies, paywalls, and
            content. We do not control and are not responsible for third-party sites, including any ads or
            trackers they use. A link is not an endorsement of everything on that site.
          </p>
        </section>

        <section aria-labelledby="t-ip">
          <h2 id="t-ip" className="mb-3 text-xl font-semibold text-slate-900">
            7. Our brand and content
          </h2>
          <p>
            The NoNews name, logo, layout, and our original explanatory text are ours or our licensors’.
            You may not misrepresent affiliation with NoNews or scrape the Service in bulk for commercial
            redistribution of our UI or database without permission. Fair personal use of the Service does not
            require a separate licence from us.
          </p>
        </section>

        <section aria-labelledby="t-disclaimer">
          <h2 id="t-disclaimer" className="mb-3 text-xl font-semibold text-slate-900">
            8. Disclaimers
          </h2>
          <p>
            THE SERVICE IS PROVIDED{" "}
            <strong className="font-semibold text-slate-800">“AS IS” AND “AS AVAILABLE”</strong>, WITHOUT
            WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT, TO THE FULLEST EXTENT
            PERMITTED BY LAW.
          </p>
        </section>

        <section aria-labelledby="t-liability">
          <h2 id="t-liability" className="mb-3 text-xl font-semibold text-slate-900">
            9. Limitation of liability
          </h2>
          <p className="mb-3">
            To the fullest extent permitted by applicable law, NoNews and its operators, contractors, and
            affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages, or for loss of profits, data, or goodwill, arising from your use of or inability to use
            the Service, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Where liability cannot be excluded, our total aggregate liability arising out of or relating to
            the Service shall not exceed the greater of (a) the amount you paid us for the Service in the
            twelve months before the claim, or (b) one hundred Indian rupees (₹100), except where mandatory
            law requires otherwise.
          </p>
        </section>

        <section aria-labelledby="t-law">
          <h2 id="t-law" className="mb-3 text-xl font-semibold text-slate-900">
            10. Governing law and disputes
          </h2>
          <p>
            These Terms are governed by the laws of India, without regard to conflict-of-law rules. Courts in
            India shall have exclusive jurisdiction over disputes arising from these Terms or the Service,
            subject to any rights you cannot waive under mandatory consumer protection rules in your place of
            residence.
          </p>
        </section>

        <section aria-labelledby="t-contact">
          <h2 id="t-contact" className="mb-3 text-xl font-semibold text-slate-900">
            11. Contact
          </h2>
          <p>
            Questions about these Terms: use our{" "}
            <Link href="/contact" className="text-slate-900 underline underline-offset-2 hover:text-slate-700">
              contact page
            </Link>
            .
          </p>
        </section>

        <p className="border-t border-slate-200 pt-8 text-sm italic text-slate-500">
          These Terms are intended to set clear, limited expectations. They are not legal advice to you or
          anyone else, and they cannot guarantee that no dispute will ever arise—only courts and regulators can
          decide how the law applies to specific facts.
        </p>
      </div>
    </main>
  );
}
