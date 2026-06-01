"use client";

import { editorialCanonicalUrl, shortenUrlForShare } from "@nonews/shared";
import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import Link from "next/link";

interface EditorialsListClientProps {
  articles: ArticleWithSource[];
}

export function EditorialsListClient({ articles }: EditorialsListClientProps) {
  const handleReadFull = (url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {articles.map((item) => (
        <div key={item.id} className="flex flex-col gap-2">
          <SummaryCard
            item={item}
            onReadFull={handleReadFull}
            onShare={async () => {
              const longUrl = editorialCanonicalUrl(item.id);
              const shareUrl = await shortenUrlForShare(longUrl);
              const text =
                [item.title, item.ai_summary ?? "", shareUrl].filter(Boolean).join("\n\n") || shareUrl;
              if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({ title: item.title, text, url: shareUrl });
              } else {
                navigator.clipboard?.writeText(text);
              }
            }}
          />
          <Link
            href={`/editorials/${item.id}`}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Full summary & analysis →
          </Link>
        </div>
      ))}
    </div>
  );
}
