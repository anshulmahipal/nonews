/**
 * URL-safe slugs for /author/[slug] and /topic/[slug] routes.
 * Lives in utils/ (not lib/) so it is always tracked by git.
 */

/** Slug from author name for /author/[slug] routes. */
export function authorNameToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Slug from category for /topic/[slug] routes (e.g. #Economy -> economy). */
export function categoryToSlug(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^#/, "");
}
