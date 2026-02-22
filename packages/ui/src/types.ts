import type { AuthorStance } from "@nonews/shared";

export interface ArticleWithSource {
  id: string;
  title: string;
  link: string;
  author: string | null;
  published_at?: string;
  ai_summary: string | null;
  ai_simplified_summary?: string | null;
  ai_stance: AuthorStance | null;
  sources: { name: string } | null;
}

/** Props for Article JSON-LD schema (editorial). */
export interface JsonLdArticleProps {
  headline: string;
  author: string;
  datePublished: string;
  articleBody: string;
  url?: string;
}

/** Single breadcrumb item for BreadcrumbList JSON-LD schema. */
export interface JsonLdBreadcrumbItem {
  name: string;
  url: string;
}

/** Props for the JsonLd component. */
export interface JsonLdProps {
  article?: JsonLdArticleProps;
  breadcrumbs?: JsonLdBreadcrumbItem[];
}
