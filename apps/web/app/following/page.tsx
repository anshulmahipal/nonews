"use client";

import Link from "next/link";
import { createSupabaseClient } from "@nonews/shared";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";

interface FollowedAuthor {
  id: string;
  name: string;
  image_url: string | null;
}

export default function FollowingPage() {
  const { isAuthenticated } = useAuth();

  const { data: authors = [], isLoading, error } = useQuery({
    queryKey: ["followed-authors"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data: followRows, error: followError } = await supabase
        .from("follows")
        .select("author_id")
        .eq("user_id", session.user.id);

      if (followError) throw followError;
      const followRowsTyped = (followRows ?? []) as { author_id: string | null }[];
      const authorIds = followRowsTyped.map((r) => r.author_id).filter(Boolean);
      if (authorIds.length === 0) return [] as FollowedAuthor[];

      const { data: authorRows, error: authorError } = await supabase
        .from("authors")
        .select("id, name, image_url")
        .in("id", authorIds);

      if (authorError) throw authorError;
      return (authorRows ?? []) as FollowedAuthor[];
    },
    enabled: isAuthenticated,
  });

  const listEmpty = authors.length === 0;

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1
          className="mb-2 text-3xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Following
        </h1>
        <p className="mb-6 text-slate-600">
          Sign in to see columnists you follow.
        </p>
        <Link
          href="/login?next=/following"
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
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-red-600">Failed to load authors.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1
        className="mb-2 text-3xl font-semibold text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Following
      </h1>
      <p className="mb-6 text-sm text-slate-500">Columnists you follow</p>

      {listEmpty ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center px-8">
          <svg className="mx-auto mb-4 h-16 w-16 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p
            className="text-center text-lg text-slate-600"
            style={{ fontFamily: "Georgia, serif" }}
          >
            No authors followed yet.
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
            Follow columnists from article pages to see them here. (Discover authors on the app.)
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {authors.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              {a.image_url ? (
                <img
                  src={a.image_url}
                  alt=""
                  className="h-12 w-12 rounded-full bg-slate-100 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white" style={{ fontFamily: "Georgia, serif" }}>
                  {a.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-slate-900" style={{ fontFamily: "Georgia, serif" }}>{a.name}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
