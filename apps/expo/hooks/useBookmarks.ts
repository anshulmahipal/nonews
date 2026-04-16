import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const BOOKMARKS_QUERY_KEY = ["bookmarks"] as const;

async function fetchBookmarkedArticleIds(): Promise<Set<string>> {
  const session = await Promise.race([
    supabase.auth.getSession().then(({ data }) => data.session ?? null),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2_500);
    }),
  ]);
  if (!session?.user) return new Set();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("user_id", session.user.id);

  if (error) return new Set();
  return new Set((data ?? []).map((row) => row.article_id));
}

/**
 * Single batched bookmark state. Uses React Query so one request is shared
 * across all consumers (avoids duplicate requests when many components mount).
 */
export function useBookmarks() {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: bookmarkedIds = new Set<string>(), refetch } = useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: fetchBookmarkedArticleIds,
    staleTime: 60 * 1000,
    refetchOnMount: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
        queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
      }
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const toggleBookmark = useCallback(
    async (articleId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;
      const isCurrentlyBookmarked = bookmarkedIds.has(articleId);

      setTogglingId(articleId);
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
          const { error } = await supabase.from("bookmarks").insert({
            user_id: userId,
            article_id: articleId,
          });
          if (error) throw error;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  return { bookmarkedIds, toggleBookmark, isBookmarked, isToggling: (id: string) => togglingId === id };
}
