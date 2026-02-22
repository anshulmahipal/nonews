import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTopicBySlug, getAllTopicSlugs } from "./getTopicBySlug";
import { TopicPageClient } from "./TopicPageClient";

import { APP_NAME } from "@nonews/shared";

/** ISR: revalidate every 1 hour. */
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Pre-renders all topic slugs (from source categories) for topic-cluster SEO.
 */
export async function generateStaticParams() {
  return getAllTopicSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTopicBySlug(slug);
  if (!data) return { title: "Topic not found" };

  const title = `${data.topicName} - Editorial Summaries | ${APP_NAME}`;
  const description = `80-word editorial summaries on ${data.topicName}. Quick reads with author stance.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/topic/${slug}`,
    },
    alternates: {
      canonical: `/topic/${slug}`,
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const data = await getTopicBySlug(slug);
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
          #{data.topicName}
        </h1>
      </header>

      <TopicPageClient topicName={data.topicName} articles={data.articles} />
    </main>
  );
}
