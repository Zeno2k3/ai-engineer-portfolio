"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/components/markdown";
import { PostMetaLine, TagList } from "@/components/post-card";
import { noteReadingMinutes, useContent, useHydrated } from "@/lib/store";

export function NoteView() {
  const id = useSearchParams().get("id");
  const { notes } = useContent();
  const hydrated = useHydrated();
  const note = notes.find((n) => n.id === id);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 py-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Tất cả bài viết
      </Link>

      {!hydrated ? (
        <p className="mt-10 text-muted">Đang tải…</p>
      ) : !note ? (
        <div className="mt-10 rounded-xl border border-border bg-surface p-6">
          <h1 className="text-xl font-semibold text-fg">Không tìm thấy ghi chú</h1>
          <p className="mt-2 text-muted">
            Ghi chú tạo trong trang admin chỉ được lưu trên trình duyệt đã tạo ra nó (bản prototype).
          </p>
        </div>
      ) : (
        <>
          <header className="mt-6 border-b border-border pb-8">
            <PostMetaLine date={note.date} readingMinutes={noteReadingMinutes(note.content)} />
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
              {note.title}
            </h1>
            {note.description && (
              <p className="mt-4 text-lg leading-relaxed text-muted">{note.description}</p>
            )}
            <div className="mt-5">
              <TagList tags={note.tags} />
            </div>
          </header>
          <div className="mt-10">
            <MarkdownContent source={note.content} />
          </div>
        </>
      )}
    </article>
  );
}
