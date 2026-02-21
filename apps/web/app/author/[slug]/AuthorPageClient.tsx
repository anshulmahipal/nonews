"use client";

import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import Link from "next/link";

interface AuthorPageClientProps {
  authorName: string;
  articles: ArticleWithSource[];
}

export function AuthorPageClient({ authorName, articles }: AuthorPageClientProps) {
  const handleReadFull = (url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        {articles.length} summar{articles.length === 1 ? "y" : "ies"} by this author.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((item) => (
          <div key={item.id} className="flex flex-col gap-2">
            <SummaryCard
              item={item}
              onReadFull={handleReadFull}
              onShare={() => {
                const text = [item.title, item.ai_summary ?? "", item.link].filter(Boolean).join("\n\n") || item.link;
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: item.title, text, url: item.link });
                } else {
                  navigator.clipboard?.writeText(text);
                }
              }}
            />
            <Link
              href={`/editorials/${item.id}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Full summary →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
