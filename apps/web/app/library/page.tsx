"use client";

import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useBookmarks } from "../../hooks/useBookmarks";
import { createSupabaseClient } from "@nonews/shared";
import { SummaryCard, type ArticleWithSource } from "@nonews/ui";
import { useQuery } from "@tanstack/react-query";

function handleReadFull(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function LibraryPage() {
  const { isAuthenticated } = useAuth();
  const { toggleBookmark, isBookmarked, isToggling } = useBookmarks();

  const { data: rows, isLoading, error } = useQuery({
    queryKey: ["saved-articles"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error: fetchError } = await supabase
        .from("bookmarks")
        .select(
          `article_id, articles (id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources(name))`
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      return (data ?? []).filter(
        (r: { articles: unknown }) => r.articles != null
      ) as Array<{ articles: ArticleWithSource }>;
    },
    enabled: isAuthenticated,
  });

  const articles = rows?.map((r) => r.articles) ?? [];
  const listEmpty = !articles.length;

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1
          className="mb-2 text-3xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Library
        </h1>
        <p className="mb-6 text-slate-600">
          Sign in to see your saved editorials.
        </p>
        <Link
          href="/login?next=/library"
          className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-slate-600">Loading your library...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-red-600">Failed to load saved articles.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1
        className="mb-2 text-3xl font-semibold text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Library
      </h1>
      <p className="mb-6 text-sm text-slate-500">Your saved editorials</p>

      {listEmpty ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-8">
          <svg className="mx-auto mb-4 h-16 w-16 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p
            className="text-center text-lg text-slate-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No saved editorials yet.
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Bookmark articles from Home to add them here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Go to Home
          </Link>
        </div>
      ) : (
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
            />
          ))}
        </div>
      )}
    </main>
  );
}
