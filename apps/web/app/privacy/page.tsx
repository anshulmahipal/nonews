import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for NoNews (nonews.in): how we handle personal data under India’s DPDP Act, your rights, and how to contact us.",
};

/**
 * Privacy Policy — DPDP-aligned; mirrors app commitments; web includes contact form handling.
 * Not a substitute for legal advice; a qualified lawyer should review before reliance.
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
        <p className="mt-3 text-sm text-slate-500" style={{ fontFamily: "Georgia, serif" }}>
          Last updated: April 2026
        </p>
        <p
          className="mt-4 text-lg leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          NoNews (“we”, “us”) operates nonews.in, our mobile apps, and related services (together, the
          “Service”). We act as a{" "}
          <strong className="font-semibold text-slate-800">Data Fiduciary</strong> under the Digital Personal
          Data Protection Act, 2023 (DPDP Act), India. This Privacy Policy explains how we collect, use,
          store, and share personal data. By using the Service, you (“Data Principal”) agree to the practices
          described here. If you do not agree, please do not use the Service.
        </p>
      </header>

      <div className="space-y-10 text-slate-600 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
        <section aria-labelledby="p-consent">
          <h2 id="p-consent" className="mb-3 text-xl font-semibold text-slate-900">
            1. Consent and lawful processing
          </h2>
          <p className="mb-3">
            We process personal data on the basis of your{" "}
            <strong className="font-semibold text-slate-800">consent</strong> where the DPDP Act requires it,
            or on another lawful ground where applicable. We do not collect personal data for undisclosed
            purposes.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Sign-in (social authentication):</strong> When you
            create or access an account via a provider such as Google or Apple, you authorise us to receive
            your <strong className="font-semibold text-slate-800">email address</strong> and{" "}
            <strong className="font-semibold text-slate-800">name</strong> from that provider. We use this
            information only to operate your account and personalise the Service (for example, saved items and
            preferences). We do not ask those providers for data beyond what you approve through the login
            flow.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Contact form (website):</strong> If you use the{" "}
            <Link href="/contact" className="text-slate-900 underline underline-offset-2 hover:text-slate-700">
              contact form
            </Link>
            , we collect the details you enter—typically your name, email address, subject line, and
            message—to read and respond to your enquiry. We do not use this channel for marketing lists unless
            we ask separately and you agree.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Push notifications:</strong> Where the Service
            offers push notifications (for example, a daily brief), we use a device token only if you opt in.
            You may withdraw that consent through device settings or in-app controls.
          </p>
          <p>
            You may{" "}
            <strong className="font-semibold text-slate-800">withdraw consent</strong> at any time. Withdrawal
            does not affect the lawfulness of processing that occurred before withdrawal. See Section 4 for
            erasure and account deletion.
          </p>
        </section>

        <section aria-labelledby="p-purpose">
          <h2 id="p-purpose" className="mb-3 text-xl font-semibold text-slate-900">
            2. Purposes of processing
          </h2>
          <p className="mb-3">We use personal data only for clear purposes, including:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-semibold text-slate-800">Service delivery:</strong> to show summaries,
              sync bookmarks or preferences, and operate features you choose to use.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Notifications:</strong> to send optional pushes
              you have enabled.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Support:</strong> to receive and answer
              messages sent via the contact form or other channels you use.
            </li>
            <li>
              <strong className="font-semibold text-slate-800">Security and integrity:</strong> to protect
              accounts, investigate abuse, and comply with law where required.
            </li>
          </ul>
          <p className="mt-3">
            We <strong className="font-semibold text-slate-800">do not sell</strong> your personal data. We{" "}
            <strong className="font-semibold text-slate-800">do not</strong> use it for cross-site targeted
            advertising in the conventional ad-tech sense.
          </p>
        </section>

        <section aria-labelledby="p-minimize">
          <h2 id="p-minimize" className="mb-3 text-xl font-semibold text-slate-900">
            3. Data minimisation and accuracy
          </h2>
          <p>
            We collect only what we reasonably need for the purposes above. We take reasonable steps to keep
            personal data accurate when we use it for those purposes. Browsing public pages without an account
            may still involve limited technical information that hosting and infrastructure providers process so
            the site can load (for example, IP address and browser type in server logs); we use such information
            only for security, debugging, and aggregate understanding of traffic where permitted.
          </p>
        </section>

        <section aria-labelledby="p-rights">
          <h2 id="p-rights" className="mb-3 text-xl font-semibold text-slate-900">
            4. Your rights under the DPDP Act
          </h2>
          <p className="mb-3">
            As a Data Principal, you have rights under the DPDP Act, including the following. We will respond in
            line with the Act and applicable rules.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Withdraw consent:</strong> You may withdraw
            consent where processing was consent-based. We will stop that processing unless another lawful
            ground applies.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Erasure:</strong> You may request deletion of your
            personal data. We will erase it when no exception applies (for example, legal retention). In our
            mobile app, use the account or profile area to delete your account where that option is available.
            You may also email us at{" "}
            <a
              href="mailto:hello@nonews.in"
              className="text-slate-900 underline underline-offset-2 hover:text-slate-700"
            >
              hello@nonews.in
            </a>{" "}
            with a clear request to delete your account or erase your data.
          </p>
          <p className="mb-3">
            <strong className="font-semibold text-slate-800">Access and correction:</strong> You may ask what
            personal data we process, for what purposes, and to whom it may be disclosed, and you may request
            correction of inaccurate or incomplete data. Contact us using the details below.
          </p>
          <p>
            <strong className="font-semibold text-slate-800">Grievance redressal:</strong> If you are not
            satisfied with our response, you may escalate in accordance with the DPDP Act, including to the Data
            Protection Board of India where applicable.
          </p>
        </section>

        <section aria-labelledby="p-share">
          <h2 id="p-share" className="mb-3 text-xl font-semibold text-slate-900">
            5. Sharing and processors
          </h2>
          <p>
            We may share personal data with{" "}
            <strong className="font-semibold text-slate-800">service providers</strong> (processors) who help
            us host the Service, authenticate users, send notifications, or store data—under agreements that
            require them to protect the data and process it only on our instructions. We may disclose
            information if required by law, court order, or competent authority, or to protect the rights and
            safety of users and the public. If our business is reorganised (for example, a merger), we will
            provide notice where the law requires. We do not sell or rent personal data.
          </p>
        </section>

        <section aria-labelledby="p-retention">
          <h2 id="p-retention" className="mb-3 text-xl font-semibold text-slate-900">
            6. Retention and security
          </h2>
          <p className="mb-3">
            We retain personal data only as long as needed for the purposes described or as required by law. When
            you request erasure and no exception applies, we delete or anonymise data within the timelines the
            law requires.
          </p>
          <p>
            We apply reasonable technical and organisational measures to protect personal data against unauthorised
            access, alteration, or loss. No online service can promise perfect security; if we become aware of an
            incident that materially affects you, we will address it in line with applicable law.
          </p>
        </section>

        <section aria-labelledby="p-children">
          <h2 id="p-children" className="mb-3 text-xl font-semibold text-slate-900">
            7. Children
          </h2>
          <p>
            The Service is not directed at children under 18. We do not knowingly collect personal data from
            children. If you believe we have, please contact us and we will take steps to delete such data.
          </p>
        </section>

        <section aria-labelledby="p-changes">
          <h2 id="p-changes" className="mb-3 text-xl font-semibold text-slate-900">
            8. Changes to this policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the revised policy on this page
            and update the “Last updated” date. For material changes, we may also notify you by reasonable means
            (for example, a notice in the app or by email). Continued use of the Service after the effective date
            means you acknowledge the updated policy.
          </p>
        </section>

        <section aria-labelledby="p-contact">
          <h2 id="p-contact" className="mb-3 text-xl font-semibold text-slate-900">
            9. Contact
          </h2>
          <p>
            Questions about this Privacy Policy or your personal data:{" "}
            <a
              href="mailto:hello@nonews.in"
              className="text-slate-900 underline underline-offset-2 hover:text-slate-700"
            >
              hello@nonews.in
            </a>{" "}
            or our{" "}
            <Link href="/contact" className="text-slate-900 underline underline-offset-2 hover:text-slate-700">
              contact page
            </Link>
            .
          </p>
        </section>

        <p className="border-t border-slate-200 pt-8 text-sm italic text-slate-500">
          This Privacy Policy is meant to describe our practices clearly. It is not legal advice. If you need
          certainty for compliance or disputes, consult a qualified professional.
        </p>
      </div>
    </main>
  );
}
