"use client";

import React from "react";
import type { JsonLdArticleProps, JsonLdBreadcrumbItem, JsonLdProps } from "../types";

function buildArticleSchema(props: JsonLdArticleProps): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: props.headline,
    author: {
      "@type": "Person",
      name: props.author,
    },
    datePublished: props.datePublished,
    articleBody: props.articleBody,
    ...(props.url && { url: props.url }),
  };
}

function buildBreadcrumbListSchema(items: JsonLdBreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Renders JSON-LD script tag(s) for SEO: Article schema (editorials) and/or BreadcrumbList.
 * Use in the document head or body so Google can show rich results and breadcrumb navigation.
 */
export function JsonLd({ article, breadcrumbs }: JsonLdProps) {
  const scripts: object[] = [];
  if (article) scripts.push(buildArticleSchema(article));
  if (breadcrumbs && breadcrumbs.length > 0) scripts.push(buildBreadcrumbListSchema(breadcrumbs));

  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
