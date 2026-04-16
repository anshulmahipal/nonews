/**
 * URL-safe slug from author name for /author/[slug] routes.
 */

export function authorNameToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
