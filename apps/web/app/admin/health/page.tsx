"use client";

import { createSupabaseClient } from "@nonews/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { SourceRow, SourceStatus } from "@nonews/shared";

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
      title={healthy ? "Healthy" : "Failing"}
      aria-hidden
    />
  );
}

/** Format duration in seconds to human string (e.g. "2m 30s"). */
function formatDurationSeconds(startIso: string, endIso: string | null): string {
  if (!endIso) return "—";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const sec = Math.round((end - start) / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function getTodayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

/** Sync log row as returned by the admin sync_logs query. */
type SyncLogRow = {
  id: string;
  run_started_at: string;
  run_finished_at: string | null;
  articles_succeeded: number;
  articles_failed: number;
  rate_limits_hit: boolean;
};

export default function AdminHealthPage() {
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const today = getTodayUtc();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "health", "stats", today],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const [articlesRes, sourcesRes] = await Promise.all([
        supabase
          .from("articles")
          .select("id, status", { count: "exact", head: false })
          .eq("processed_date", today),
        supabase.from("sources").select("id, status", { count: "exact", head: false }),
      ]);
      const articles = (articlesRes.data ?? []) as { id: string; status: string }[];
      const sources = (sourcesRes.data ?? []) as { id: string; status: string }[];
      const totalToday = articles.length;
      const completed = articles.filter((a) => a.status === "completed").length;
      const failed = articles.filter((a) => a.status === "failed").length;
      const successRate =
        totalToday > 0 ? Math.round((completed / totalToday) * 100) : 0;
      const failingSources = sources.filter((s) => s.status === "failing").length;
      return {
        totalArticlesToday: totalToday,
        aiSuccessRatePercent: successRate,
        failingSourcesCount: failingSources,
      };
    },
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery<SourceRow[]>({
    queryKey: ["admin", "sources"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("sources")
        .select("id, name, rss_url, category, is_active, status, last_synced_at, last_error_message")
        .order("name");
      if (error) throw error;
      return (data ?? []) as SourceRow[];
    },
  });

  const { data: syncLogs, isLoading: syncLogsLoading } = useQuery<SyncLogRow[]>({
    queryKey: ["admin", "sync_logs"],
    queryFn: async () => {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("sync_logs")
        .select("id, run_started_at, run_finished_at, articles_succeeded, articles_failed, rate_limits_hit")
        .order("run_started_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as SyncLogRow[];
    },
  });

  const retryPending = useCallback(async () => {
    setRetryError(null);
    setRetrying(true);
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.functions.invoke("ai-processor");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await queryClient.invalidateQueries({ queryKey: ["admin", "health"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "sync_logs"] });
    } catch (e) {
      setRetryError(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setRetrying(false);
    }
  }, [queryClient]);

  const isLoading = statsLoading || sourcesLoading;
  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-slate-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Health
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pipeline stats, sources, sync history, and AI retry
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Total Articles Today</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {stats?.totalArticlesToday ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">processed_date = {today}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">AI Success Rate</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {stats?.aiSuccessRatePercent ?? 0}%
          </p>
          <p className="mt-0.5 text-xs text-slate-400">completed / total today</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Failing Sources</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {stats?.failingSourcesCount ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">status = failing</p>
        </div>
      </div>

      {/* Retry action */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={retryPending}
          disabled={retrying}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {retrying ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Running AI processor…
            </span>
          ) : (
            "Retry pending articles (AI processor)"
          )}
        </button>
        {retryError && (
          <span className="text-sm text-red-600">{retryError}</span>
        )}
      </div>

      {/* Source table */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">RSS sources</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 font-medium text-slate-700">Name</th>
                <th className="px-4 py-3 font-medium text-slate-700">Category</th>
                <th className="px-4 py-3 font-medium text-slate-700">Last synced</th>
              </tr>
            </thead>
            <tbody>
              {(sources ?? []).map((source) => (
                <tr key={source.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <StatusDot
                      status={source.status as SourceStatus}
                      lastSyncedAt={source.last_synced_at}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{source.name}</td>
                  <td className="px-4 py-3 text-slate-600">{source.category}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {source.last_synced_at
                      ? new Date(source.last_synced_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sources?.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            No sources.
          </p>
        )}
      </section>

      {/* Sync history */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Sync history (last 10)</h2>
        {syncLogsLoading ? (
          <p className="text-slate-500">Loading sync logs…</p>
        ) : !syncLogs?.length ? (
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
            No sync runs yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-medium text-slate-700">Started</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Duration</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Succeeded</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Failed</th>
                  <th className="px-4 py-3 font-medium text-slate-700">Rate limits</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(log.run_started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDurationSeconds(log.run_started_at, log.run_finished_at)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{log.articles_succeeded}</td>
                    <td className="px-4 py-3 text-slate-700">{log.articles_failed}</td>
                    <td className="px-4 py-3">
                      {log.rate_limits_hit ? (
                        <span className="font-medium text-amber-600">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
