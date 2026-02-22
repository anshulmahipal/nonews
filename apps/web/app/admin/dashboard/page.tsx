"use client";

import { createSupabaseClient } from "@nonews/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { SourceStatus } from "@nonews/shared";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function isHealthy(status: SourceStatus, lastSyncedAt: string | null): boolean {
  if (status === "failing") return false;
  if (status === "healthy") return true;
  if (!lastSyncedAt) return false;
  const synced = new Date(lastSyncedAt).getTime();
  return Date.now() - synced < TWENTY_FOUR_HOURS_MS;
}

function StatusDot({
  status,
  lastSyncedAt,
}: {
  status: SourceStatus;
  lastSyncedAt: string | null;
}) {
  const healthy = isHealthy(status, lastSyncedAt);
  return (
    <span
      className={`inline-block h-3 w-3 shrink-0 rounded-full ${
        healthy ? "bg-emerald-500" : "bg-red-500"
      }`}
      title={healthy ? "Healthy (synced in last 24h)" : "Failing"}
      aria-hidden
    />
  );
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { data: sources, isLoading } = useQuery({
    queryKey: ["admin", "sources"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("sources")
        .select("id, name, rss_url, category, is_active, status, last_synced_at, last_error_message")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const syncSource = useCallback(
    async (sourceId: string) => {
      setSyncError(null);
      setSyncingId(sourceId);
      try {
        const supabase = createSupabaseClient();
        const { data, error } = await supabase.functions.invoke("daily-ingestor", {
          body: { source_id: sourceId },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        await queryClient.invalidateQueries({ queryKey: ["admin", "sources"] });
      } catch (e) {
        setSyncError(e instanceof Error ? e.message : "Sync failed");
      } finally {
        setSyncingId(null);
      }
    },
    [queryClient]
  );

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Loading sources…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            RSS sources and manual sync
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/health"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Health
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </Link>
        </div>
      </div>

      {syncError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {syncError}
        </div>
      )}

      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {(sources ?? []).map((source) => (
          <li
            key={source.id}
            className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap"
          >
            <StatusDot
              status={source.status as SourceStatus}
              lastSyncedAt={source.last_synced_at}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{source.name}</p>
              <p className="truncate text-sm text-slate-500">{source.rss_url}</p>
              {source.last_synced_at && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Last synced:{" "}
                  {new Date(source.last_synced_at).toLocaleString()}
                </p>
              )}
              {source.last_error_message && (
                <p className="mt-0.5 text-xs text-red-600">
                  {source.last_error_message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => syncSource(source.id)}
              disabled={syncingId === source.id}
              className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {syncingId === source.id ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Syncing…
                </span>
              ) : (
                "Sync now"
              )}
            </button>
          </li>
        ))}
      </ul>

      {sources?.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
          No sources configured.
        </p>
      )}
    </main>
  );
}
