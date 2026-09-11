import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-card";
import { PageHeader } from "@/components/section-heading";
import { getAllSeries, getSeries } from "@/lib/posts";
import { containerClass } from "@/lib/ui";

// Series được tạo tự động từ frontmatter `series:` + `seriesPart:` của bài viết.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ slug: series.slug }));
}

export async function generateMetadata({ params }: PageProps<"/series/[slug]">): Promise<Metadata> {
  const series = getSeries((await params).slug);
  if (!series) return {};
  return {
    title: `Series: ${series.name}`,
    description: `Series ${series.posts.length} phần: ${series.name}.`,
    alternates: { canonical: `/series/${series.slug}` },
  };
}

export default async function SeriesPage({ params }: PageProps<"/series/[slug]">) {
  const series = getSeries((await params).slug);
  if (!series) notFound();

  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader label="Series" title={series.name} description={`${series.posts.length} phần — đọc theo thứ tự.`} />
      <div className="max-w-3xl">
        <PostList posts={series.posts} />
      </div>
    </div>
  );
}
