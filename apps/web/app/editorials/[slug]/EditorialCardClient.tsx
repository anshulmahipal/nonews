"use client";

import { SummaryCard, type ArticleWithSource } from "@nonews/ui";

interface EditorialCardClientProps {
  article: ArticleWithSource;
}

export function EditorialCardClient({ article }: EditorialCardClientProps) {
  const handleReadFull = (url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = () => {
    const text = [article.title, article.ai_summary ?? "", article.link].filter(Boolean).join("\n\n") || article.link;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: article.title, text, url: article.link });
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  return (
    <SummaryCard
      item={article}
      onReadFull={handleReadFull}
      onShare={handleShare}
    />
  );
}
