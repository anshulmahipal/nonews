/**
 * OAuth redirect base URL. Prefer NEXT_PUBLIC_APP_URL on Vercel/production so Google → Supabase
 * returns users to nonews.in even if Supabase “Site URL” was left as localhost during setup.
 * Falls back to window.location.origin for local dev when env is unset.
 */
export function getOAuthRedirectOrigin(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Allow only same-origin relative paths (blocks protocol-relative //evil.com). */
export function safeNextPath(next: string | null): string {
  const path = next ?? "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}
