import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export function tagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`;
}

export function PostMetaLine({
  date,
  updated,
  readingMinutes,
}: {
  date: string;
  updated?: string;
  readingMinutes: number;
}) {
  return (
    <p className="font-mono text-xs text-subtle">
      <time dateTime={date}>{formatDate(date)}</time>
      {updated && updated !== date && (
        <>
          <span aria-hidden> · </span>
          cập nhật <time dateTime={updated}>{formatDate(updated)}</time>
        </>
      )}
      <span aria-hidden> · </span>
      {readingMinutes} phút đọc
    </p>
  );
}

const tagClass =
  "inline-flex min-h-6 items-center rounded-full border border-border px-2.5 font-mono text-xs text-accent-2";

/** `linked` = mỗi tag là link tới /tags/<tag> (không dùng bên trong card đã là một link). */
export function TagList({ tags, linked = false }: { tags: string[]; linked?: boolean }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Chủ đề">
      {tags.map((tag) => (
        <li key={tag}>
          {linked ? (
            <Link href={tagHref(tag)} className={`${tagClass} transition-colors hover:border-accent-2`}>
              #{tag}
            </Link>
          ) : (
            <span className={tagClass}>#{tag}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col gap-3 border border-border bg-surface p-5 transition-colors duration-(--dur-fast) hover:border-fg"
    >
      <PostMetaLine date={post.date} readingMinutes={post.readingMinutes} />
      <h3 className="flex items-start justify-between gap-3 text-xl font-semibold leading-snug text-fg">
        {post.title}
        <ArrowUpRight
          className="mt-1 size-4 shrink-0 text-subtle transition-transform duration-(--dur-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </h3>
      {post.description && <p className="line-clamp-3 leading-relaxed text-muted">{post.description}</p>}
      <div className="mt-auto pt-1">
        <TagList tags={post.tags} />
      </div>
    </Link>
  );
}

/** Danh sách dạng dòng (trang Blog, Tag, Series). */
export function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {posts.map((post) => (
        <li key={post.slug} className="py-6">
          <PostMetaLine date={post.date} updated={post.updated} readingMinutes={post.readingMinutes} />
          <h2 className="mt-2 text-2xl font-semibold leading-snug">
            <Link href={`/blog/${post.slug}`} className="text-fg transition-colors hover:text-accent">
              {post.title}
            </Link>
            {post.draft && (
              <span className="ml-2 align-middle font-mono text-xs font-normal text-accent-2">[nháp]</span>
            )}
          </h2>
          {post.description && <p className="mt-2 max-w-[65ch] leading-relaxed text-muted">{post.description}</p>}
          <div className="mt-3">
            <TagList tags={post.tags} linked />
          </div>
        </li>
      ))}
    </ul>
  );
}
