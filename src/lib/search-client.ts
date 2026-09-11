// Tìm kiếm phía client trên chỉ mục tĩnh /search.json (tạo lúc build, không có backend, không log query).

import { useEffect, useState } from "react";
import { normalizeText } from "@/lib/utils";

export type SearchItem = {
  title: string;
  href: string;
  kind: "Trang" | "Bài viết" | "Dự án" | "Lộ trình" | "Tag";
  description?: string;
  keywords?: string;
};

let cache: Promise<SearchItem[]> | null = null;

function loadIndex(): Promise<SearchItem[]> {
  cache ??= fetch("/search.json")
    .then((res) => (res.ok ? (res.json() as Promise<SearchItem[]>) : []))
    .catch(() => {
      cache = null; // lỗi mạng → lần sau thử lại
      return [];
    });
  return cache;
}

/** Tải chỉ mục khi `enabled` (lần đầu mở ⌘K / vào /search); null = đang tải. */
export function useSearchIndex(enabled: boolean): SearchItem[] | null {
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    if (!enabled || items) return;
    let alive = true;
    loadIndex().then((data) => {
      if (alive) setItems(data);
    });
    return () => {
      alive = false;
    };
  }, [enabled, items]);

  return items;
}

/** Khớp mọi từ (không phân biệt dấu); ưu tiên khớp ở tiêu đề. */
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const q = normalizeText(query.trim());
  if (!q) return items;
  const words = q.split(/\s+/);

  return items
    .map((item) => {
      const title = normalizeText(item.title);
      const haystack = normalizeText([item.title, item.description, item.keywords, item.kind].join(" "));
      if (!words.every((word) => haystack.includes(word))) return null;
      const score =
        (title.startsWith(q) ? 4 : 0) + (title.includes(q) ? 2 : 0) + words.filter((w) => title.includes(w)).length;
      return { item, score };
    })
    .filter((result): result is { item: SearchItem; score: number } => result !== null)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
