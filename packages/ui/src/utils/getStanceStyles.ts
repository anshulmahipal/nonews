import type { AuthorStance } from "@nonews/shared";

/** Web: Tailwind classes for badge and left border */
export interface StanceStylesWeb {
  badge: string;
  border: string;
}

/** Native: Hex colors for badge and left border */
export interface StanceStylesNative {
  badge: string;
  border: string;
}

const STANCE_MAP_WEB: Record<string, StanceStylesWeb> = {
  Critical: { badge: "bg-pink-500", border: "border-l-pink-500" },
  Supportive: { badge: "bg-emerald-500", border: "border-l-emerald-500" },
  Balanced: { badge: "bg-amber-500", border: "border-l-amber-500" },
  Sarcastic: { badge: "bg-indigo-500", border: "border-l-indigo-500" },
  Neutral: { badge: "bg-slate-400", border: "border-l-slate-400" },
};

const STANCE_MAP_NATIVE: Record<string, StanceStylesNative> = {
  Critical: { badge: "#ec4899", border: "#ec4899" },
  Supportive: { badge: "#10b981", border: "#10b981" },
  Balanced: { badge: "#f59e0b", border: "#f59e0b" },
  Sarcastic: { badge: "#6366f1", border: "#6366f1" },
  Neutral: { badge: "#94a3b8", border: "#94a3b8" },
};

const DEFAULT_WEB: StanceStylesWeb = { badge: "bg-slate-400", border: "border-l-slate-400" };
const DEFAULT_NATIVE: StanceStylesNative = { badge: "#94a3b8", border: "#94a3b8" };

/** Returns Tailwind classes for web (badge background + card left border). */
export function getStanceStylesWeb(stance: AuthorStance | null): StanceStylesWeb {
  if (!stance) return DEFAULT_WEB;
  return STANCE_MAP_WEB[stance] ?? DEFAULT_WEB;
}

/** Returns hex colors for React Native (badge background + card left border). */
export function getStanceStylesNative(stance: AuthorStance | null): StanceStylesNative {
  if (!stance) return DEFAULT_NATIVE;
  return STANCE_MAP_NATIVE[stance] ?? DEFAULT_NATIVE;
}
