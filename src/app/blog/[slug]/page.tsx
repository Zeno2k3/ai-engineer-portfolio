import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Route, Rss } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { MdxContent } from "@/components/mdx-content";
import { PostCard, PostMetaLine, TagList } from "@/components/post-card";
import { SeriesNav } from "@/components/series-nav";
import { TableOfContents } from "@/components/toc";
import { getRoadmap } from "@/lib/content";
import { absoluteUrl, breadcrumbLd, personLd } from "@/lib/jsonld";
import { getAllPosts, getPost, getRelatedPosts, getSeries } from "@/lib/posts";
import { getHeadings } from "@/lib/toc";
import { containerClass, linkClass } from "@/lib/ui";
import { slugify } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      locale: "vi_VN",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
    },
  };
}

const backLinkClass = "inline-flex items-center gap-1.5 py-2 font-mono text-sm text-muted transition-colors hover:text-fg";

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const headings = getHeadings(post.content);
  const showToc = headings.length >= 2;
  const series = post.series ? getSeries(slugify(post.series)) : null;
  const related = getRelatedPosts(post);
  const stage = post.stage ? getRoadmap().find((s) => s.id === post.stage) : undefined;
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            headline: post.title,
            description: post.description,
            image: [absoluteUrl(`/blog/${post.slug}/opengraph-image`)],
            datePublished: `${post.date}T00:00:00+07:00`,
            dateModified: `${post.updated ?? post.date}T00:00:00+07:00`,
            author: personLd(),
            wordCount: post.wordCount,
            keywords: post.tags,
            inLanguage: "vi",
          },
          breadcrumbLd([
            { name: "Trang chủ", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <div className="reading-progress" aria-hidden />

      <div className={`${containerClass} py-12 sm:py-16`}>
        <div className={showToc ? "xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16" : ""}>
          <article className="mx-auto min-w-0 max-w-3xl xl:mx-0">
            <Link href="/blog" className={backLinkClass}>
              <ArrowLeft className="size-4" aria-hidden /> Tất cả bài viết
            </Link>

            <header className="mt-6 border-b-2 border-fg pb-8">
              <PostMetaLine date={post.date} updated={post.updated} readingMinutes={post.readingMinutes} />
              <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-fg sm:text-5xl">{post.title}</h1>
              {post.description && <p className="mt-5 text-xl leading-relaxed text-muted">{post.description}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <TagList tags={post.tags} linked />
                {stage && (
                  <Link href={`/roadmap/${stage.id}`} className={linkClass}>
                    <Route className="size-3.5" aria-hidden /> {stage.title}
                  </Link>
                )}
              </div>
            </header>

            {showToc && (
              <details className="mt-8 border border-border bg-surface p-4 xl:hidden">
                <summary className="cursor-pointer font-mono text-sm text-fg">Mục lục</summary>
                <ol className="mt-3 space-y-1.5">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                      <a href={`#${heading.id}`} className="font-mono text-sm text-muted hover:text-fg">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div className="mt-10">
              <MdxContent source={post.content} math={post.math} />
            </div>

            {series && <SeriesNav series={series} current={post.slug} />}

            <aside className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y-2 border-fg py-5">
              <p className="text-lg text-fg-soft">Theo dõi bài mới qua RSS — không cần email.</p>
              <a href="/rss.xml" className={linkClass}>
                <Rss className="size-4" aria-hidden /> /rss.xml
              </a>
            </aside>

            {related.length > 0 && (
              <section aria-labelledby="lien-quan" className="mt-12">
                <h2 id="lien-quan" className="text-2xl font-semibold text-fg">
                  Bài liên quan
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <PostCard key={item.slug} post={item} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {showToc && (
            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
