"use client";

import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { createSupabaseClient } from "@nonews/shared";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const { isAuthenticated, signOut } = useAuth();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session: s } } = await createSupabaseClient().auth.getSession();
      return s;
    },
    enabled: isAuthenticated,
  });

  const email = session?.user?.email ?? null;
  const displayName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.user_metadata?.name ??
    email?.split("@")[0] ??
    "Reader";

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1
          className="mb-2 text-3xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Profile
        </h1>
        <p className="mb-6 text-slate-600">
          Sign in to manage your account.
        </p>
        <Link
          href="/login?next=/profile"
          className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1
        className="mb-2 text-3xl font-semibold text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Profile
      </h1>
      <p className="mb-6 text-sm text-slate-500">Your account</p>

      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
          {displayName}
        </p>
        {email && (
          <p className="mt-1 text-sm text-slate-500">{email}</p>
        )}

        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
          className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </main>
  );
}
