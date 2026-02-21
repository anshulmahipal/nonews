import Link from "next/link";
import type { ArticleWithSource } from "@nonews/ui";

interface RelatedInsightsProps {
  articles: ArticleWithSource[];
  /** Optional topic/category label for the section (e.g. "#Economy"). */
  topicLabel?: string | null;
  /** URL slug for the topic landing page (e.g. indian-economy). */
  topicSlug?: string | null;
}

export function RelatedInsights({ articles, topicLabel, topicSlug }: RelatedInsightsProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200 pt-8" aria-label="Related insights">
      <h2
        className="mb-4 text-xl font-semibold text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Related Insights
      </h2>
      <ul className="flex flex-col gap-3">
        {articles.map((item) => (
          <li key={item.id}>
            <Link
              href={`/editorials/${item.id}`}
              className="group block rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900 group-hover:underline" style={{ fontFamily: "Georgia, serif" }}>
                {item.title}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                {item.sources?.name && <span>{item.sources.name}</span>}
                {item.author && <span>· {item.author}</span>}
                {topicLabel && (topicSlug ? (
                  <Link
                    href={`/topic/${topicSlug}`}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                  >
                    {topicLabel.startsWith("#") ? topicLabel : `#${topicLabel}`}
                  </Link>
                ) : (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                    {topicLabel.startsWith("#") ? topicLabel : `#${topicLabel}`}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
