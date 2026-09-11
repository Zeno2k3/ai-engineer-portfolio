import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";

// Một mục trong danh sách bài: có thể là bài MDX hoặc ghi chú tạo từ trang admin.
export type FeedItem = {
  key: string;
  href: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  stageId?: string;
};

export function PostMetaLine({ date, readingMinutes }: { date: string; readingMinutes: number }) {
  return (
    <p className="font-mono text-xs text-subtle">
      <time dateTime={date}>{formatDate(date)}</time>
      <span aria-hidden> · </span>
      {readingMinutes} phút đọc
    </p>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Chủ đề">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted"
        >
          #{tag}
        </li>
      ))}
    </ul>
  );
}

export function PostCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent-strong/60"
    >
      <PostMetaLine date={item.date} readingMinutes={item.readingMinutes} />
      <h3 className="flex items-start justify-between gap-3 text-lg font-semibold leading-snug text-fg">
        {item.title}
        <ArrowUpRight
          className="mt-1 size-4 shrink-0 text-subtle transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </h3>
      {item.description && (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{item.description}</p>
      )}
      <div className="mt-auto pt-1">
        <TagList tags={item.tags} />
      </div>
    </Link>
  );
}
