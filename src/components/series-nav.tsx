import Link from "next/link";
import type { Series } from "@/lib/posts";

/** Điều hướng trong series nhiều phần: "Phần 2/4" + danh sách các phần. */
export function SeriesNav({ series, current }: { series: Series; current: string }) {
  const index = series.posts.findIndex((post) => post.slug === current);

  return (
    <nav aria-label={`Series ${series.name}`} className="not-prose my-10 border-2 border-fg bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Series · Phần {index + 1}/{series.posts.length}
      </p>
      <p className="mt-1 text-xl font-semibold">
        <Link href={`/series/${series.slug}`} className="text-fg hover:text-accent">
          {series.name}
        </Link>
      </p>
      <ol className="mt-4 space-y-1">
        {series.posts.map((post, i) => (
          <li key={post.slug} className="flex gap-3 font-mono text-sm">
            <span className="text-subtle">{String(i + 1).padStart(2, "0")}</span>
            {post.slug === current ? (
              <span aria-current="page" className="font-semibold text-fg">
                {post.title}
              </span>
            ) : (
              <Link href={`/blog/${post.slug}`} className="text-muted underline-offset-4 hover:text-fg hover:underline">
                {post.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
