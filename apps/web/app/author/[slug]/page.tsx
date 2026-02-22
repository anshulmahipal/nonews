import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthorBySlug, getAllAuthorSlugs } from "./getAuthorBySlug";
import { AuthorPageClient } from "./AuthorPageClient";

import { APP_NAME } from "@nonews/shared";

/** ISR: revalidate every 1 hour for fresh content and lower DB load. */
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Pre-renders all author slugs at build (and on-demand) for "summaries by [Author Name]" SEO.
 */
export async function generateStaticParams() {
  return getAllAuthorSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthorBySlug(slug);
  if (!data) return { title: "Author not found" };

  const title = `Summaries by ${data.authorName} | ${APP_NAME}`;
  const description = `Editorial summaries and analysis by ${data.authorName}. 80-word quick reads with author stance.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/author/${slug}`,
    },
    alternates: {
      canonical: `/author/${slug}`,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAuthorBySlug(slug);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="mb-2">
          <Link href="/editorials" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Editorials
          </Link>
        </p>
        <h1
          className="text-3xl font-semibold text-slate-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Summaries by {data.authorName}
        </h1>
      </header>

      <AuthorPageClient authorName={data.authorName} articles={data.articles} />
    </main>
  );
}
