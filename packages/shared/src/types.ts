/**
 * Domain interfaces for Editorial Quick Read.
 * Core types shared across apps and Supabase functions.
 */

/** Author stance label from AI (Gemini). */
export type AuthorStance =
  | "Supportive"
  | "Critical"
  | "Neutral"
  | "Sarcastic"
  | "Balanced";

/** Article processing status. */
export type ArticleStatus = "pending" | "completed" | "failed";

/** Article entity – AI summary, stance, and processing status. */
export interface Article {
  ai_summary: string;
  ai_stance: AuthorStance;
  status: ArticleStatus;
}

/** RSS/editorial source. */
export interface Source {
  id: string;
  name: string;
  rss_url: string;
  category: string;
  is_active: boolean;
}
