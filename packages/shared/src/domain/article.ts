/**
 * Domain types for Article (Editorial Quick Read).
 * Align with DB schema and APP_FLOW: ingest -> AI processor -> delivery.
 */

import type { AuthorStance, ArticleStatus } from "../database.types";

export type { ArticleStatus };

/**
 * Full article entity (DB row shape).
 * Use for admin/backoffice or when raw_content is needed.
 */
export interface Article {
  id: string;
  source_id: string;
  guid: string;
  title: string;
  link: string;
  author: string | null;
  published_at: string;
  raw_content: string | null;
  ai_summary: string | null;
  ai_stance: AuthorStance | null;
  status: ArticleStatus;
  /** Edition date (IST); use for "Today's Edition" filter. */
  processed_date: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Quick Read view: summary + stance for delivery (Next.js / Expo).
 * Omits raw_content; use for listing and "Today's Edition".
 */
export interface ArticleSummary {
  id: string;
  source_id: string;
  guid: string;
  title: string;
  link: string;
  author: string | null;
  published_at: string;
  ai_summary: string | null;
  ai_stance: AuthorStance | null;
  status: ArticleStatus;
  processed_date: string;
  created_at?: string;
}

/**
 * Input for creating an article (ingestor output).
 */
export interface ArticleCreate {
  source_id: string;
  guid: string;
  title: string;
  link: string;
  author?: string | null;
  published_at: string;
  raw_content?: string | null;
  processed_date?: string;
}

/**
 * Input for updating after AI processor (summary + stance).
 */
export interface ArticleUpdateFromAI {
  ai_summary: string;
  ai_stance: AuthorStance;
  status: ArticleStatus;
}
