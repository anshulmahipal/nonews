/**
 * URL-safe slug for topic/category routes (e.g. /topic/indian-economy).
 * Matches #Economy, Economy, Indian Economy -> economy, indian-economy.
 */

export function categoryToSlug(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^#/, "");
}
