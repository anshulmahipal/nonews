"use client";

import { editorialCanonicalUrl, shortenUrlForShare } from "@nonews/shared";
import { SummaryCard, type ArticleWithSource } from "@nonews/ui";

interface EditorialCardClientProps {
  article: ArticleWithSource;
}

export function EditorialCardClient({ article }: EditorialCardClientProps) {
  const handleReadFull = (url: string) => {
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const longUrl = editorialCanonicalUrl(article.id);
    const shareUrl = await shortenUrlForShare(longUrl);
    const text =
      [article.title, article.ai_summary ?? "", shareUrl].filter(Boolean).join("\n\n") || shareUrl;
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: article.title, text, url: shareUrl });
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
