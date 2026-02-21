"use client";

import Link from "next/link";

/**
 * Shown when a non-admin user hits /admin/* (after auth check).
 */
export default function AdminForbiddenPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1
        className="mb-2 text-2xl font-semibold text-slate-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Access denied
      </h1>
      <p className="mb-6 text-slate-600">
        You don’t have permission to view this page.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Back to home
      </Link>
    </main>
  );
}
