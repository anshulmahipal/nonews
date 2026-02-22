/**
 * Fetches a single editorial (article) by slug for server components and metadata.
 * Slug is the article id (UUID).
 */

import { createSupabaseClient } from "@nonews/shared";

export interface EditorialMeta {
  id: string;
  title: string;
  author: string | null;
  ai_summary: string | null;
  ai_stance: "Supportive" | "Critical" | "Neutral" | "Sarcastic" | "Balanced" | null;
}

export async function getEditorialBySlug(slug: string): Promise<EditorialMeta | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, author, ai_summary, ai_stance")
    .eq("id", slug)
    .eq("status", "completed")
    .single();

  if (error || !data) return null;
  return data as EditorialMeta;
}
