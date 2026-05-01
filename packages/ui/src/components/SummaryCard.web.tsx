"use client";

import type { ArticleWithSource } from "../types";
import {
  getStanceDescription,
  STANCE_DESCRIPTIONS,
  STANCE_TAG_HELP_INTRO,
  STANCES_ORDERED,
} from "@nonews/shared";
import { Bookmark, ExternalLink, Info, RotateCcw, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  onShare,
}: SummaryCardProps) {
  const [showInfoFace, setShowInfoFace] = useState(false);

  useEffect(() => {
    if (!showInfoFace) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowInfoFace(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showInfoFace]);

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

  const summaryText = item.ai_summary ?? "No summary available.";
  const currentLabel = item.ai_stance ?? "Unlabeled";

  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm ${border}`}
    >
      <div className="relative perspective-distant">
        <div
          className="relative min-h-0 transform-3d transition-transform duration-500 ease-out"
          style={{
            transform: showInfoFace ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front: article */}
          <div className="relative p-4 backface-hidden [-webkit-backface-visibility:hidden]">
            <div className="mb-3 flex items-center justify-between px-1 pt-1 pb-2">
              <div className="flex items-center gap-2">
                <StanceBadge stance={item.ai_stance} />
                <button
                  type="button"
                  onClick={() => setShowInfoFace(true)}
                  className="-m-1 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                  aria-label="What does this tag mean? Flip card to explain."
                >
                  <Info className="h-4 w-4" aria-hidden />
                </button>
              </div>
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
            <div className="mb-3 flex items-center gap-2 border-t border-slate-200 pt-3">
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 rounded-sm object-contain"
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
          </div>

          {/* Back: stance help */}
          <div
            className="absolute inset-0 flex min-h-full flex-col bg-white p-4 backface-hidden [-webkit-backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            <h3
              className="mb-3 shrink-0 text-lg font-semibold text-slate-900"
              style={{ fontFamily: "Georgia, serif" }}
            >
              What this tag means
            </h3>
            <div className="min-h-0 flex-1 overflow-y-auto text-sm text-slate-600">
              <p className="mb-3 leading-relaxed">{STANCE_TAG_HELP_INTRO}</p>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                This article
              </p>
              <p className="mb-3 leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">{currentLabel}</span>
                {" — "}
                {getStanceDescription(item.ai_stance)}
              </p>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                All tags
              </p>
              <ul className="space-y-2 pb-2 text-slate-700">
                {STANCES_ORDERED.map((key) => (
                  <li key={key}>
                    <span className="font-semibold text-slate-900">{key}</span>
                    {" — "}
                    {STANCE_DESCRIPTIONS[key]}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoFace(false)}
              className="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              aria-label="Back to article"
            >
              <RotateCcw size={18} aria-hidden />
              Back to article
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
