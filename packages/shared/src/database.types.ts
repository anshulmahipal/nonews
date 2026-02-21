/**
 * Database types for Editorial Quick Read (sources + articles).
 * Align with PROJECT_CONTEXT.md schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Article processing status. */
export type ArticleStatus = "pending" | "completed" | "failed_ai";

/** Author stance label from AI (Gemini). */
export type AuthorStance =
  | "Supportive"
  | "Critical"
  | "Neutral"
  | "Sarcastic"
  | "Balanced";

/** Source sync health status (admin dashboard). */
export type SourceStatus = "healthy" | "failing" | "inactive";

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          rss_url: string;
          category: string;
          is_active: boolean;
          created_at?: string;
          updated_at?: string;
          last_synced_at: string | null;
          last_error_message: string | null;
          status: SourceStatus;
        };
        Insert: {
          id?: string;
          name: string;
          rss_url: string;
          category: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_synced_at?: string | null;
          last_error_message?: string | null;
          status?: SourceStatus;
        };
        Update: {
          id?: string;
          name?: string;
          rss_url?: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          last_synced_at?: string | null;
          last_error_message?: string | null;
          status?: SourceStatus;
        };
      };
      authors: {
        Row: {
          id: string;
          name: string;
          bio: string | null;
          image_url: string | null;
          twitter_handle: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio?: string | null;
          image_url?: string | null;
          twitter_handle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string | null;
          image_url?: string | null;
          twitter_handle?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          guid: string;
          title: string;
          link: string;
          author: string | null;
          author_id: string | null;
          published_at: string;
          raw_content: string | null;
          ai_summary: string | null;
          ai_simplified_summary: string | null;
          ai_stance: AuthorStance | null;
          status: ArticleStatus;
          processed_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          guid: string;
          title: string;
          link: string;
          author?: string | null;
          author_id?: string | null;
          published_at: string;
          raw_content?: string | null;
          ai_summary?: string | null;
          ai_simplified_summary?: string | null;
          ai_stance?: AuthorStance | null;
          status?: ArticleStatus;
          processed_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          guid?: string;
          title?: string;
          link?: string;
          author?: string | null;
          author_id?: string | null;
          published_at?: string;
          raw_content?: string | null;
          ai_summary?: string | null;
          ai_simplified_summary?: string | null;
          ai_stance?: AuthorStance | null;
          status?: ArticleStatus;
          processed_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          expo_push_token: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          expo_push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          expo_push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmark_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          user_id: string;
          author_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          author_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          author_id?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          user_id: string;
          article_id: string;
          folder_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          article_id: string;
          folder_id?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          article_id?: string;
          folder_id?: string | null;
          created_at?: string;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          run_started_at: string;
          run_finished_at: string | null;
          articles_succeeded: number;
          articles_failed: number;
          rate_limits_hit: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_started_at?: string;
          run_finished_at?: string | null;
          articles_succeeded?: number;
          articles_failed?: number;
          rate_limits_hit?: boolean;
          created_at?: string;
        };
        Update: {
          run_started_at?: string;
          run_finished_at?: string | null;
          articles_succeeded?: number;
          articles_failed?: number;
          rate_limits_hit?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      article_status: ArticleStatus;
      author_stance: AuthorStance;
    };
  };
}

/** Helper: row type for a table. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Helper: insert type for a table. */
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Helper: enum values. */
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type SourceRow = Tables<"sources">;
export type ArticleRow = Tables<"articles">;
export type ArticleInsert = Insertable<"articles">;
export type SourceInsert = Insertable<"sources">;
