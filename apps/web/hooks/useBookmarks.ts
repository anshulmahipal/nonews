"use client";

import { createSupabaseClient } from "@nonews/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

const BOOKMARKS_QUERY_KEY = ["bookmarks"] as const;

async function fetchBookmarkedArticleIds(): Promise<Set<string>> {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return new Set();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("user_id", session.user.id);

  if (error) return new Set();
  const rows = (data ?? []) as { article_id: string }[];
  return new Set(rows.map((row) => row.article_id));
}

/**
 * Single batched bookmark state. Uses React Query so one request is shared
 * across all consumers (avoids N duplicate requests when many components mount).
 */
export function useBookmarks() {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  const { data: bookmarkedIds = new Set<string>(), refetch } = useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: fetchBookmarkedArticleIds,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabaseRef.current = supabase;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Only refetch on sign in/out so we don't storm on TOKEN_REFRESHED
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
        queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const toggleBookmark = useCallback(
    async (articleId: string) => {
      const supabase = supabaseRef.current ?? createSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/login?next=/";
        return;
      }

      setTogglingId(articleId);
      const userId = session.user.id;
      const isCurrentlyBookmarked = bookmarkedIds.has(articleId);

      queryClient.setQueryData<Set<string>>(BOOKMARKS_QUERY_KEY, (prev) => {
        const next = new Set(prev ?? []);
        if (isCurrentlyBookmarked) next.delete(articleId);
        else next.add(articleId);
        return next;
      });

      try {
        if (isCurrentlyBookmarked) {
          const { error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("user_id", userId)
            .eq("article_id", articleId);
          if (error) throw error;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase inferred Insert as never for bookmarks
          const { error } = await (supabase.from("bookmarks") as any).insert({
            user_id: userId,
            article_id: articleId,
          });
          if (error) throw error;
        }
      } catch {
        await refetch();
      } finally {
        setTogglingId(null);
      }
    },
    [bookmarkedIds, queryClient, refetch]
  );

  const isBookmarked = useCallback(
    (articleId: string) => bookmarkedIds.has(articleId),
    [bookmarkedIds]
  );

  const isToggling = useCallback(
    (articleId: string) => togglingId === articleId,
    [togglingId]
  );

  return { toggleBookmark, isBookmarked, isToggling };
}
