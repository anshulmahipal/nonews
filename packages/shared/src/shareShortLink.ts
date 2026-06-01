import { SITE_URL } from "./branding";

/** Canonical editorial URLs allowed for shortening (matches Worker rules). */
export function isAllowedEditorialShareUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const isHttps = u.protocol === "https:";
    const isLocalHttp =
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1");
    if (!isHttps && !isLocalHttp) return false;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length !== 2 || parts[0] !== "editorials") return false;
    if (parts[1].length < 1 || parts[1].length > 128) return false;
    return (
      u.hostname === "nonews.in" ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

/** Web uses same-origin /api/shorten; native uses production SITE_URL. */
export function getShortenApiBase(): string {
  const w = (globalThis as { window?: { location?: { origin?: string } } }).window;
  const origin = w?.location?.origin;
  if (origin) return origin;
  return SITE_URL;
}

/**
 * Returns a short go.* URL when /api/shorten succeeds; otherwise returns longUrl.
 */
export async function shortenUrlForShare(longUrl: string): Promise<string> {
  if (!isAllowedEditorialShareUrl(longUrl)) return longUrl;
  const base = getShortenApiBase();
  try {
    const r = await fetch(`${base}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl }),
    });
    if (!r.ok) return longUrl;
    const data = (await r.json()) as { shortUrl?: string };
    return typeof data.shortUrl === "string" ? data.shortUrl : longUrl;
  } catch {
    return longUrl;
  }
}

/** Build canonical editorial URL for an article id (web slug is numeric id). */
export function editorialCanonicalUrl(articleId: string): string {
  return `${SITE_URL}/editorials/${encodeURIComponent(articleId)}`;
}
