"use client";

import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import {
  createSupabaseClient,
  EDITORIAL_FEED_PAGE_SIZE,
  fetchCompletedEditorialsPage,
} from "@nonews/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBookmarks } from "../hooks/useBookmarks";

function getLocalDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function handleReadFull(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function HomePage() {
  const todayLocal = useMemo(() => getLocalDateString(), []);
  const [displayDate, setDisplayDate] = useState<string>("");
  const { isAuthenticated, signOut } = useAuth();
  const { toggleBookmark, isBookmarked, isToggling } = useBookmarks();

  useEffect(() => {
    setDisplayDate(formatDisplayDate());
  }, []);

  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["editorial-feed", "sort-processed-date"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const supabase = createSupabaseClient();
      const rows = await fetchCompletedEditorialsPage(supabase, {
        limit: EDITORIAL_FEED_PAGE_SIZE,
        offset: pageParam,
      });
      return (rows ?? []) as ArticleWithSource[];
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < EDITORIAL_FEED_PAGE_SIZE
        ? undefined
        : lastPageParam + EDITORIAL_FEED_PAGE_SIZE,
  });

  const articles = useMemo(
    () => infiniteData?.pages.flat() ?? [],
    [infiniteData?.pages]
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "320px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isArchiveOnly = useMemo(() => {
    if (!articles?.length) return false;
    return !articles.some(
      (a) =>
        (a as ArticleWithSource & { processed_date?: string }).processed_date ===
        todayLocal
    );
  }, [articles, todayLocal]);

  const listEmpty = !articles || articles.length === 0;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-slate-600">Loading today&apos;s edition...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <p className="text-center text-red-600">
            Failed to load articles. Please try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-3xl font-semibold text-slate-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Today&apos;s Edition
          </h1>
          <p className="mt-1 text-sm text-slate-500" suppressHydrationWarning>
            {displayDate}
          </p>
          {isArchiveOnly && !listEmpty ? (
            <p className="mt-1 text-xs text-slate-400">
              Showing latest editorials from your archive (nothing dated for today yet).
            </p>
          ) : null}
        </div>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="self-start text-sm font-medium text-slate-700 underline hover:text-slate-900"
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/login?next=/"
            className="self-start text-sm font-medium text-slate-700 underline hover:text-slate-900"
          >
            Sign in to bookmark
          </Link>
        )}
      </header>

      {listEmpty ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-8">
          <div className="mb-7 flex items-center justify-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="drop-shadow-sm"
            >
              <circle cx="60" cy="60" r="52" fill="#fef3c7" stroke="#fde68a" strokeWidth="1.5" />
              <path
                d="M42 48h32c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H42c-2.2 0-4-1.8-4-4V52c0-2.2 1.8-4 4-4z"
                fill="#fef3c7"
                stroke="#a16207"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M74 56h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-2"
                fill="none"
                stroke="#a16207"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M48 38c0-2 1.5-4 3-4h18c1.5 0 3 2 3 4v2H48v-2z"
                fill="#fde68a"
                stroke="#a16207"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M52 32c.6-1.2 2-2 4-2 2 0 3.4.8 4 2" stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M64 30c.6-1.2 2-2 4-2 2 0 3.4.8 4 2" stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M76 32c.6-1.2 2-2 4-2 2 0 3.4.8 4 2" stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
            </svg>
          </div>
          <p
            className="text-center text-lg text-slate-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            The editors are still at work.
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Check back in a few minutes!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {articles.map((item) => (
              <SummaryCard
                key={item.id}
                item={item}
                onReadFull={handleReadFull}
                isBookmarked={isBookmarked(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
                isBookmarkDisabled={isToggling(item.id)}
                onShare={() => {
                  const text = [item.title, item.ai_summary ?? "", item.link].filter(Boolean).join("\n\n") || item.link;
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: item.title, text, url: item.link });
                  } else {
                    navigator.clipboard?.writeText(text);
                  }
                }}
                onExplainRequested={async (articleId) => {
                  const supabase = createSupabaseClient();
                  const { data, error } = await supabase.functions.invoke("simplify-summary", {
                    body: { articleId },
                  });
                  if (error) return null;
                  return (data?.simplified as string) ?? null;
                }}
              />
            ))}
          </div>
          {hasNextPage ? (
            <div
              ref={loadMoreRef}
              className="flex min-h-[48px] items-center justify-center py-8"
              aria-hidden
            >
              {isFetchingNextPage ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
