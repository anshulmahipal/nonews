import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "NoNews mission: informing India's decision makers. AI ethics: we use Gemini to summarize; original authorship belongs to the source publications. nonews.in",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-10">
        <h1
          className="text-3xl font-semibold tracking-tight text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          About
        </h1>
        <p
          className="mt-3 text-lg leading-relaxed text-slate-600"
          style={{ fontFamily: "Georgia, serif" }}
        >
          NoNews delivers concise, high-signal summaries of
          editorials so you can stay informed without the noise.
        </p>
      </header>

      <section className="mb-10">
        <h2
          className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span aria-hidden className="text-slate-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
          Our Mission
        </h2>
        <p className="text-slate-600 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
          We exist to <strong className="font-semibold text-slate-800">inform India&apos;s decision makers</strong>. Whether you lead in policy, business, or civil society, your time is scarce and the news cycle is relentless. We curate editorials from trusted publications and distill them into brief, scannable summaries—so you can grasp the argument, see the stance, and decide what deserves a deeper read.
        </p>
      </section>

      <section id="ai-ethics" className="mb-10 scroll-mt-6">
        <h2
          className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <span aria-hidden className="text-slate-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </span>
          AI &amp; Ethics
        </h2>
        <p className="text-slate-600 leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
          We use Google&apos;s Gemini to generate our summaries. The AI condenses long editorials into roughly 80-word briefs and surfaces the author&apos;s stance. <strong className="font-semibold text-slate-800">The original authorship, reporting, and views belong entirely to the source publications.</strong> We do not create the news—we summarize it. Every piece links back to the full article so you can read the original and form your own view.
        </p>
      </section>

      <p
        className="text-sm italic text-slate-500"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Thank you for reading. Stay informed.
      </p>
    </main>
  );
}
