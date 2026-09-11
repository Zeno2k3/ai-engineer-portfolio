import Link from "next/link";
import { Rss } from "lucide-react";
import { tagHref } from "@/components/post-card";
import { linkClass } from "@/lib/ui";

const chip = "inline-flex h-10 items-center gap-1.5 border px-4 font-mono text-sm transition-colors";

/** Bộ lọc tag dạng link (render phía server, mỗi tag là một trang tĩnh /tags/<tag>). */
export function TagNav({ tags, active }: { tags: { tag: string; count: number }[]; active?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <nav aria-label="Lọc theo tag" className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          aria-current={active ? undefined : "page"}
          className={`${chip} ${active ? "border-border text-muted hover:border-fg hover:text-fg" : "border-fg bg-accent-strong text-on-accent"}`}
        >
          Tất cả
        </Link>
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={tagHref(tag)}
            aria-current={active === tag ? "page" : undefined}
            className={`${chip} ${
              active === tag
                ? "border-fg bg-accent-strong text-on-accent"
                : "border-border text-muted hover:border-fg hover:text-fg"
            }`}
          >
            #{tag}
            <span className="text-xs opacity-80">{count}</span>
          </Link>
        ))}
      </nav>
      <a href="/rss.xml" className={linkClass}>
        <Rss className="size-4" aria-hidden /> RSS
      </a>
    </div>
  );
}
