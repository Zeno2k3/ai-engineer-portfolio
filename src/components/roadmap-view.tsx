"use client";

// /roadmap          → toàn bộ lộ trình + tổng tiến độ
// /roadmap?id=<id>  → chi tiết một giai đoạn: chủ đề, tiến độ, khoá học, ghi chú

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Circle, CircleCheck, CircleDot } from "lucide-react";
import { CredentialCard, ProgressBar, StageCard, StatusIcon, useFeed } from "@/components/content-sections";
import { PostCard } from "@/components/post-card";
import { PageHeader } from "@/components/section-heading";
import type { PostMeta } from "@/lib/posts";
import { ROADMAP_STATUS_LABELS, currentTopic, stageProgress } from "@/lib/site";
import { useContent, useHydrated } from "@/lib/store";

const backLinkClass = "inline-flex items-center gap-1.5 py-2 text-sm text-muted transition-colors hover:text-fg";

export function RoadmapView({ posts }: { posts: PostMeta[] }) {
  const id = useSearchParams().get("id");
  const hydrated = useHydrated();

  if (!id) return <RoadmapOverview />;
  if (!hydrated) return <p className="mx-auto max-w-3xl px-5 py-16 text-muted">Đang tải…</p>;
  return <StageDetail id={id} posts={posts} />;
}

// ---------- Toàn bộ lộ trình ----------

function RoadmapOverview() {
  const { roadmap } = useContent();
  const allTopics = roadmap.flatMap((stage) => stage.topics);
  const doneTopics = allTopics.filter((topic) => topic.done).length;
  const percent = allTopics.length ? Math.round((doneTopics / allTopics.length) * 100) : 0;
  const doneStages = roadmap.filter((stage) => stage.status === "done").length;

  const stats = [
    { value: `${percent}%`, label: "Tổng tiến độ" },
    { value: `${doneStages}/${roadmap.length}`, label: "Giai đoạn hoàn thành" },
    { value: `${doneTopics}/${allTopics.length}`, label: "Chủ đề đã học" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <PageHeader
        label="Roadmap"
        title="Lộ trình học"
        description="Toàn bộ các giai đoạn trên hành trình AI Engineer. Bấm vào từng giai đoạn để xem đang học gì, tới đâu, học khoá nào và các ghi chú."
      />

      <section aria-label="Tổng quan tiến độ" className="mb-10 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <dl className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-muted sm:text-sm">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <ProgressBar percent={percent} label="Tổng tiến độ lộ trình" className="mt-5 h-2" />
      </section>

      {roadmap.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Chưa có giai đoạn nào — thêm trong trang Admin.
        </p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((stage, index) => (
            <li key={stage.id}>
              <StageCard stage={stage} index={index} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------- Chi tiết giai đoạn ----------

function SectionTitle({ id, title, count }: { id: string; title: string; count?: number }) {
  return (
    <h2 id={id} className="text-xl font-semibold tracking-tight text-fg">
      {title}
      {count !== undefined && <span className="ml-2 font-mono text-sm font-normal text-subtle">{count}</span>}
    </h2>
  );
}

function StageDetail({ id, posts }: { id: string; posts: PostMeta[] }) {
  const { roadmap, credentials } = useContent();
  const feed = useFeed(posts);

  const index = roadmap.findIndex((stage) => stage.id === id);
  const stage = roadmap[index];

  if (!stage) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/roadmap" className={backLinkClass}>
          <ArrowLeft className="size-4" aria-hidden /> Lộ trình học
        </Link>
        <div className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h1 className="text-xl font-semibold text-fg">Không tìm thấy giai đoạn này</h1>
          <p className="mt-2 text-muted">Có thể giai đoạn đã bị xoá hoặc đổi trong trang admin.</p>
        </div>
      </div>
    );
  }

  const progress = stageProgress(stage);
  const current = currentTopic(stage);
  const courses = credentials.filter((c) => c.stageId === stage.id);
  const related = feed.filter((item) => item.stageId === stage.id);
  const prev = roadmap[index - 1];
  const next = roadmap[index + 1];

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Link href="/roadmap" className={backLinkClass}>
        <ArrowLeft className="size-4" aria-hidden /> Lộ trình học
      </Link>

      {/* Header */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-subtle">
            Giai đoạn {String(index + 1).padStart(2, "0")} / {String(roadmap.length).padStart(2, "0")}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              stage.status === "next" ? "border-border text-subtle" : "border-accent-strong/40 text-accent"
            }`}
          >
            <StatusIcon status={stage.status} className="size-3.5" />
            {ROADMAP_STATUS_LABELS[stage.status]}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">{stage.title}</h1>
        {stage.description && <p className="mt-4 text-lg leading-relaxed text-muted">{stage.description}</p>}
      </header>

      {/* Tiến độ */}
      <section aria-label="Tiến độ" className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold tracking-tight text-fg">{progress.percent}%</p>
            <p className="mt-1 text-sm text-muted">
              Đã học xong {progress.done}/{progress.total} chủ đề
            </p>
          </div>
          {current && (
            <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-fg">
              <span className="text-accent">Đang học:</span> <strong className="font-semibold">{current}</strong>
            </p>
          )}
        </div>
        <ProgressBar percent={progress.percent} label={`Tiến độ ${stage.title}`} className="mt-5 h-2" />
      </section>

      {/* Checklist chủ đề */}
      <section aria-labelledby="noi-dung" className="mt-10">
        <SectionTitle id="noi-dung" title="Nội dung học" />
        {stage.topics.length === 0 ? (
          <p className="mt-4 text-muted">Chưa có chủ đề nào — thêm trong trang Admin.</p>
        ) : (
          <ol className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {stage.topics.map((topic, i) => {
              const isCurrent = topic.name === current;
              const state = topic.done ? "Đã xong" : isCurrent ? "Đang học" : "Chưa học";
              return (
                <li
                  key={`${i}-${topic.name}`}
                  className={`flex items-center gap-3 px-4 py-3.5 ${isCurrent ? "bg-accent-soft" : ""}`}
                >
                  {topic.done ? (
                    <CircleCheck className="size-5 shrink-0 text-accent" aria-hidden />
                  ) : isCurrent ? (
                    <CircleDot className="size-5 shrink-0 text-accent" aria-hidden />
                  ) : (
                    <Circle className="size-5 shrink-0 text-subtle" aria-hidden />
                  )}
                  <span
                    className={`flex-1 ${topic.done || isCurrent ? "text-fg" : "text-muted"} ${
                      isCurrent ? "font-semibold" : ""
                    }`}
                  >
                    {topic.name}
                  </span>
                  <span className={`font-mono text-xs ${topic.done || isCurrent ? "text-accent" : "text-subtle"}`}>
                    {state}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Khoá học & chứng chỉ */}
      <section aria-labelledby="khoa-hoc" className="mt-10">
        <SectionTitle id="khoa-hoc" title="Khoá học & chứng chỉ" count={courses.length} />
        {courses.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted">
            Chưa gắn khoá học nào. Trong Admin → Chứng chỉ & Khoá học, chọn “Thuộc giai đoạn lộ trình” là{" "}
            <strong className="text-fg">{stage.title}</strong>.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4">
            {courses.map((item, i) => (
              <li key={`${i}-${item.title}`}>
                <CredentialCard item={item} showStage={false} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ghi chú liên quan */}
      <section aria-labelledby="ghi-chu" className="mt-10">
        <SectionTitle id="ghi-chu" title="Ghi chú trong giai đoạn này" count={related.length} />
        {related.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted">
            Chưa có ghi chú nào. Khi viết ghi chú trong Admin, chọn “Thuộc giai đoạn lộ trình” là{" "}
            <strong className="text-fg">{stage.title}</strong>.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <PostCard key={item.key} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Điều hướng giai đoạn */}
      <nav aria-label="Giai đoạn khác" className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/roadmap?id=${encodeURIComponent(prev.id)}`}
            className="group rounded-xl border border-border p-4 transition-colors hover:border-subtle"
          >
            <span className="inline-flex items-center gap-1 text-xs text-subtle">
              <ArrowLeft className="size-3.5" aria-hidden /> Giai đoạn trước
            </span>
            <span className="mt-1 block font-medium text-fg group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/roadmap?id=${encodeURIComponent(next.id)}`}
            className="group rounded-xl border border-border p-4 text-right transition-colors hover:border-subtle"
          >
            <span className="inline-flex items-center gap-1 text-xs text-subtle">
              Giai đoạn tiếp theo <ArrowRight className="size-3.5" aria-hidden />
            </span>
            <span className="mt-1 block font-medium text-fg group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
