"use client";

import type { ArticleWithSource } from "../types";
import { getStanceDescription } from "@nonews/shared";
import { Bookmark, ExternalLink, Info, Share2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

const TOOLTIP_MAX_WIDTH_PX = 288; // ~18rem

function StanceTagTooltip({
  stance,
}: {
  stance: ArticleWithSource["ai_stance"];
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const btn = anchorRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const pad = 8;
    const vw =
      typeof window !== "undefined" ? window.innerWidth : TOOLTIP_MAX_WIDTH_PX;
    const width = Math.min(TOOLTIP_MAX_WIDTH_PX, vw - pad * 2);
    let left = rect.left;
    if (left + width > vw - pad) {
      left = vw - pad - width;
    }
    if (left < pad) {
      left = pad;
    }
    setPos({ top: rect.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (bubbleRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const label = stance ?? "Unlabeled";
  const description = getStanceDescription(stance);

  const tooltipContent =
    open && typeof document !== "undefined" ? (
      <div
        ref={bubbleRef}
        className="fixed z-9999 w-[min(18rem,calc(100vw-1rem))] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-lg"
        style={{ top: pos.top, left: pos.left }}
        role="tooltip"
      >
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="mt-1.5 leading-snug text-slate-600">{description}</p>
      </div>
    ) : null;

  return (
    <div className="relative shrink-0">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="-m-1 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        aria-label={`What does the ${label} tag mean?`}
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
      {tooltipContent ? createPortal(tooltipContent, document.body) : null}
    </div>
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

  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm ${border}`}
    >
      <div className="mb-3 flex items-center justify-between px-1 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <StanceBadge stance={item.ai_stance} />
          <StanceTagTooltip stance={item.ai_stance} />
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
    </article>
  );
}
