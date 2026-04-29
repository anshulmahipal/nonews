"use client";

import type { ArticleWithSource } from "../types";
import { Bookmark, ExternalLink, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { getStanceStylesWeb } from "../utils/getStanceStyles";
import { formatPublishedAt } from "../utils/formatPublishedAt";

/** Domain from article link for favicon URL. */
function getDomain(link: string): string {
  try {
    return new URL(link).hostname;
  } catch {
    return "";
  }
}

interface SummaryCardProps {
  item: ArticleWithSource;
  onReadFull: (url: string) => void;
  /** Whether this article is bookmarked. Omit to hide bookmark button. */
  isBookmarked?: boolean;
  /** Called when user clicks bookmark. Omit to hide bookmark button. */
  onToggleBookmark?: () => void;
  /** Disable bookmark button (e.g. while toggling). */
  isBookmarkDisabled?: boolean;
  /** Fetches simplified "explain like I'm 5" summary. If provided, shows Explain button. */
  onExplainRequested?: (articleId: string) => Promise<string | null>;
  /** Called when user clicks Share. If provided, shows Share button. */
  onShare?: () => void;
}

function StanceBadge({ stance }: { stance: ArticleWithSource["ai_stance"] }) {
  const label = stance ?? "Unknown";
  const { badge } = getStanceStylesWeb(stance);
  return (
    <span
      className={`inline-block self-start rounded px-2 py-1 text-xs font-medium text-white ${badge}`}
    >
      {label}
    </span>
  );
}

export function SummaryCard({
  item,
  onReadFull,
  isBookmarked,
  onToggleBookmark,
  isBookmarkDisabled = false,
  onExplainRequested,
  onShare,
}: SummaryCardProps) {
  const [localSimplified, setLocalSimplified] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  const sourceName = item.sources?.name ?? "Unknown Source";
  const sourceDomain = getDomain(item.link);
  const faviconUrl = sourceDomain
    ? `https://www.google.com/s2/favicons?domain=${sourceDomain}&sz=32`
    : null;
  const author = item.author ?? "—";
  const { border } = getStanceStylesWeb(item.ai_stance);
  const publishedLabel = item.published_at
    ? formatPublishedAt(item.published_at)
    : null;
  const showBookmark = onToggleBookmark != null;
  const showExplain = onExplainRequested != null;
  const simplifiedText = item.ai_simplified_summary ?? localSimplified;

  const handleExplain = async () => {
    if (!onExplainRequested || explainLoading) return;
    setExplainError(null);
    setExplainLoading(true);
    try {
      const result = await onExplainRequested(item.id);
      if (result) setLocalSimplified(result);
      else setExplainError("Could not simplify.");
    } catch {
      setExplainError("Something went wrong.");
    } finally {
      setExplainLoading(false);
    }
  };

  const summaryText = item.ai_summary ?? "No summary available.";

  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm ${border}`}
    >
      <div className="mb-3 flex items-center justify-between px-1 pt-1 pb-2">
        <StanceBadge stance={item.ai_stance} />
        {showBookmark && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleBookmark?.();
            }}
            disabled={isBookmarkDisabled}
            className="-m-1 rounded p-1 text-slate-400 transition-transform hover:scale-110 hover:text-slate-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <Bookmark size={22} fill="#0f172a" strokeWidth={1.5} />
            ) : (
              <Bookmark size={22} strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      <h3
        className="mb-2 text-lg font-semibold leading-snug text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {item.title}
      </h3>
      <div className="mb-3">
        <p
          className="text-base leading-relaxed text-slate-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {summaryText}
        </p>
      </div>
      {showExplain && (
        <>
          <button
            type="button"
            onClick={handleExplain}
            disabled={explainLoading}
            className="mb-3 inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-opacity hover:bg-slate-100 disabled:opacity-60"
          >
            {explainLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            ) : (
              <Sparkles size={16} />
            )}
            Explain like I&apos;m 5
          </button>
          {simplifiedText && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-800">
                Simple version
              </p>
              <p
                className="whitespace-pre-line text-sm leading-relaxed text-amber-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {simplifiedText}
              </p>
            </div>
          )}
          {explainError && (
            <p className="mb-3 text-sm text-red-600">{explainError}</p>
          )}
        </>
      )}
      <div className="mb-3 flex items-center gap-2 border-t border-slate-200 pt-3">
        {faviconUrl && (
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 flex-shrink-0 rounded-sm object-contain"
          />
        )}
        <p className="text-sm text-slate-500">
          {sourceName} · {author}
          {publishedLabel && ` · ${publishedLabel}`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onReadFull(item.link)}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ExternalLink size={16} />
          Read Full Article
        </button>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-opacity hover:bg-slate-50"
          >
            <Share2 size={16} />
            Share
          </button>
        )}
      </div>
    </article>
  );
}
