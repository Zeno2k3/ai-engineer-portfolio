import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { Callout } from "@/components/callout";
import { PostMetaLine, TagList } from "@/components/post-card";
import { getAllPosts, getPost } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 py-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tất cả bài viết
      </Link>

      <header className="mt-6 border-b border-border pb-8">
        <PostMetaLine date={post.date} readingMinutes={post.readingMinutes} />
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{post.description}</p>
        <div className="mt-5">
          <TagList tags={post.tags} />
        </div>
      </header>

      <div className="prose post-prose mt-10 max-w-none">
        <MDXRemote
          source={post.content}
          components={{ Callout }}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypePrettyCode,
                  { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false },
                ],
              ],
            },
          }}
        />
      </div>
    </article>
  );
}
