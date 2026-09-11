"use client";

// ⌘K / Ctrl+K ở bất kỳ đâu: điều hướng + tìm kiếm hợp nhất. Dùng <dialog> gốc của trình duyệt
// (tự giữ focus bên trong, Esc để đóng).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CornerDownLeft, Search } from "lucide-react";
import { searchItems, useSearchIndex, type SearchItem } from "@/lib/search-client";

const MAX_RESULTS = 8;

export function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const items = useSearchIndex(open);

  const results = items ? searchItems(items, query).slice(0, MAX_RESULTS) : [];

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  function go(item: SearchItem) {
    close();
    router.push(item.href);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Tìm kiếm (Ctrl+K)"
        className="inline-flex h-10 cursor-pointer items-center gap-2 border border-border px-3 font-mono text-xs text-muted transition-colors hover:border-fg hover:text-fg"
      >
        <Search className="size-4" aria-hidden />
        <kbd className="hidden sm:inline">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Tìm kiếm và điều hướng"
        onClose={close}
        onClick={(event) => event.target === dialogRef.current && close()}
        className="palette mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] border-2 border-fg bg-surface p-0 text-fg hard-shadow-static"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Tìm bài viết, dự án, chủ đề…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${active}` : undefined}
            className="h-14 w-full bg-transparent font-mono text-base text-fg placeholder:text-subtle focus:outline-none"
          />
          <kbd className="font-mono text-xs text-subtle">Esc</kbd>
        </div>

        {items === null ? (
          <p className="px-4 py-6 font-mono text-sm text-muted">Đang tải chỉ mục…</p>
        ) : results.length === 0 ? (
          <div className="px-4 py-6">
            <p className="text-fg">Không có kết quả cho “{query}”.</p>
            <p className="mt-2 font-mono text-sm text-muted">
              Thử từ khoá khác, hoặc{" "}
              <Link href="/blog" onClick={close} className="text-accent underline-offset-4 hover:underline">
                xem tất cả bài viết
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul id="palette-results" role="listbox" aria-label="Kết quả" className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((item, i) => (
              <li key={item.href} id={`palette-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={item.href}
                  onClick={close}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 ${i === active ? "bg-accent-strong text-on-accent" : "text-fg"}`}
                >
                  <span className={`w-20 shrink-0 font-mono text-xs ${i === active ? "" : "text-subtle"}`}>{item.kind}</span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {i === active && <CornerDownLeft className="size-4 shrink-0" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="border-t border-border px-4 py-2 font-mono text-xs text-subtle">
          ↑↓ chọn · Enter mở · Esc đóng ·{" "}
          <Link href={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`} onClick={close} className="underline-offset-4 hover:underline">
            trang tìm kiếm
          </Link>
        </p>
      </dialog>
    </>
  );
}
