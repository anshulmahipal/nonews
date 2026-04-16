/**
 * @nonews/shared – Supabase client and TypeScript types for NoNews.
 */

export { APP_NAME, SITE_DOMAIN, SITE_URL } from "./branding";
export type { Article, Source, AuthorStance, ArticleStatus } from "./types";
export {
  createSupabaseClient,
  getSupabaseClient,
  type SupabaseClient,
} from "./supabase";
export type {
  Database,
  Tables,
  Insertable,
  Enums,
  Json,
  SourceRow,
  ArticleRow,
  ArticleInsert,
  SourceInsert,
  SourceStatus,
} from "./database.types";
export type {
  ArticleSummary,
  ArticleCreate,
  ArticleUpdateFromAI,
  SourceCreate,
} from "./domain";
export { simplifySummary } from "./ai";
export {
  EDITORIAL_FEED_SELECT,
  fetchLatestCompletedEditorials,
} from "./editorialFeed";
