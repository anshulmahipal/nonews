"use client";

import { createSupabaseClient } from "@nonews/shared";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

/** Parse hash fragment into key-value pairs */
function parseHash(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || !hash.startsWith("#")) return params;
  const pairs = hash.slice(1).split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value) params[key] = decodeURIComponent(value);
  }
  return params;
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const next = searchParams.get("next") ?? "/";
      const supabase = createSupabaseClient();

      // Supabase may put auth data in hash (implicit) or query (PKCE)
      const code = searchParams.get("code");
      const hashParams = typeof window !== "undefined" ? parseHash(window.location.hash) : {};

      const errorParam = searchParams.get("error") ?? hashParams.error;
      if (errorParam) {
        setError(hashParams.error_description ?? searchParams.get("error_description") ?? "Sign-in failed.");
        return;
      }

      // PKCE: code in query string
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        // Full redirect so session is read fresh from storage
        window.location.href = next.startsWith("/") ? next : "/";
        return;
      }

      // Implicit: access_token in hash
      const accessToken = hashParams.access_token;
      const refreshToken = hashParams.refresh_token;
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        // Full redirect so session is read fresh from storage
        window.location.href = next.startsWith("/") ? next : "/";
        return;
      }

      setError("No authorization code or tokens received.");
    };

    run();
  }, [searchParams]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6">
        <p className="mb-4 text-center text-red-600">{error}</p>
        <a href="/login" className="text-sm text-slate-600 underline hover:text-slate-900">
          Try again
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <p className="mt-4 text-slate-600">Completing sign-in…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="mt-4 text-slate-600">Completing sign-in…</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
