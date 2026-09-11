"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { searchItems, useSearchIndex } from "@/lib/search-client";

export function SearchView() {
  const router = useRouter();
  const initial = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const items = useSearchIndex(true);
  const results = items && query.trim() ? searchItems(items, query) : [];
  const popularTags = (items ?? []).filter((item) => item.kind === "Tag").slice(0, 8);

  function update(value: string) {
    setQuery(value);
    router.replace(value ? `/search?q=${encodeURIComponent(value)}` : "/search", { scroll: false });
  }

  return (
    <div className="max-w-3xl">
      <label htmlFor="search-input" className="font-mono text-sm text-muted">
        Từ khoá
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(event) => update(event.target.value)}
        placeholder="RAG, embeddings, prompt…"
        autoFocus
        className="mt-2 h-14 w-full border-2 border-fg bg-surface px-4 font-mono text-base text-fg placeholder:text-subtle focus:outline-none focus-visible:outline-3 focus-visible:outline-accent"
      />

      <div aria-live="polite" className="mt-8">
        {items === null ? (
          <p className="font-mono text-sm text-muted">Đang tải chỉ mục…</p>
        ) : !query.trim() ? (
          <p className="text-muted">Gõ để tìm trong bài viết, dự án và lộ trình. Mẹo: nhấn Ctrl+K ở bất kỳ trang nào.</p>
        ) : results.length === 0 ? (
          <div>
            <p className="text-lg text-fg">Không có kết quả cho “{query}”.</p>
            {popularTags.length > 0 && (
              <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-sm text-muted">
                Thử:
                {popularTags.map((tag) => (
                  <Link key={tag.href} href={tag.href} className="border border-border px-2 py-0.5 text-accent-2 hover:border-fg">
                    {tag.title}
                  </Link>
                ))}
              </p>
            )}
            <Link href="/blog" className="mt-4 inline-block text-accent underline-offset-4 hover:underline">
              Xem tất cả bài viết →
            </Link>
          </div>
        ) : (
          <>
            <p className="font-mono text-sm text-muted">{results.length} kết quả</p>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {results.map((item) => (
                <li key={item.href} className="py-4">
                  <p className="font-mono text-xs text-subtle">{item.kind}</p>
                  <Link href={item.href} className="mt-1 block text-xl font-semibold text-fg hover:text-accent">
                    {item.title}
                  </Link>
                  {item.description && <p className="mt-1 text-muted">{item.description}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
