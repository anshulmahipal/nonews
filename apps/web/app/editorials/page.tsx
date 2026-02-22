import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseClient } from "@nonews/shared";
import type { ArticleWithSource } from "@nonews/ui";
import { EditorialsListClient } from "./EditorialsListClient";

/** ISR: revalidate every 1 hour so the list stays fresh without hitting the DB on every request. */
export const revalidate = 3600;

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

async function getTodayEditorials(): Promise<ArticleWithSource[]> {
  const today = getTodayDateString();
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, link, author, published_at, ai_summary, ai_simplified_summary, ai_stance, sources(name)")
    .eq("processed_date", today)
    .eq("status", "completed")
    .order("published_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as ArticleWithSource[];
}

export const metadata: Metadata = {
  title: "Editorials — Summary & Analysis",
  description: "Today’s editorials in 80-word summaries with author stance. NoNews · nonews.in",
};

export default async function EditorialsListPage() {
  const articles = await getTodayEditorials();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="mb-2">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Home
          </Link>
        </p>
        <h1
          className="text-3xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Editorials
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Today&apos;s edition · {articles.length} summar{articles.length === 1 ? "y" : "ies"}
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-slate-600">
          <p>No editorials for today yet. Check back later.</p>
        </div>
      ) : (
        <EditorialsListClient articles={articles} />
      )}
    </main>
  );
}
