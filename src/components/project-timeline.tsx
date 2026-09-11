"use client";

// Thời gian dự án ("07/2026 – nay · 3 tháng"). Chạy phía client để thời lượng của dự án đang làm
// luôn tính theo tháng hiện tại, không bị "đóng băng" ở thời điểm build.

import { useSyncExternalStore } from "react";
import { CalendarDays } from "lucide-react";
import { projectTimeline, type ProjectMeta } from "@/lib/site";

const noopSubscribe = () => () => {};

function currentMonth(): string {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

/** Tháng hiện tại "MM/YYYY" trên trình duyệt; null khi render phía server (tránh lệch hydration). */
export function useCurrentMonth(): string | null {
  return useSyncExternalStore(noopSubscribe, currentMonth, () => null);
}

export function ProjectTimeline({ project }: { project: Pick<ProjectMeta, "startDate" | "endDate"> }) {
  const timeline = projectTimeline(project, useCurrentMonth());
  if (!timeline) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-subtle">
      <CalendarDays className="size-3.5 shrink-0" aria-hidden />
      <span>{timeline.range}</span>
      {timeline.duration && (
        <>
          <span aria-hidden>·</span>
          <span className="text-fg-soft">{timeline.duration}</span>
        </>
      )}
    </p>
  );
}
