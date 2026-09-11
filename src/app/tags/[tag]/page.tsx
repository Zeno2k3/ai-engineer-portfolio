import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post-card";
import { PageHeader } from "@/components/section-heading";
import { TagNav } from "@/components/tag-nav";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { containerClass } from "@/lib/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const tag = decode((await params).tag);
  return {
    title: `#${tag}`,
    description: `Các bài viết về ${tag}.`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const tag = decode((await params).tag);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader label="Tag" title={`#${tag}`} description={`${posts.length} bài viết gắn tag này.`} />
      <TagNav tags={getAllTags()} active={tag} />
      <div className="max-w-3xl">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
