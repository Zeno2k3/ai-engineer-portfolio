import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Circle, CircleCheck, CircleDot } from "lucide-react";
import { CredentialCard, ProgressBar, ProjectCard, StatusIcon, stageHref } from "@/components/content-sections";
import { PostCard } from "@/components/post-card";
import { getCredentials, getProjects, getRoadmap } from "@/lib/content";
import { getAllPosts } from "@/lib/posts";
import { ROADMAP_STATUS_LABELS, currentTopic, stageProgress } from "@/lib/site";
import { containerClass } from "@/lib/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRoadmap().map((stage) => ({ id: stage.id }));
}

export async function generateMetadata({ params }: PageProps<"/roadmap/[id]">): Promise<Metadata> {
  const { id } = await params;
  const stage = getRoadmap().find((s) => s.id === id);
  if (!stage) return {};
  return {
    title: `${stage.title} — Lộ trình`,
    description: stage.description,
    alternates: { canonical: stageHref(stage.id) },
  };
}

function SectionTitle({ id, title, count }: { id: string; title: string; count?: number }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight text-fg">
      {title}
      {count !== undefined && <span className="ml-2 font-mono text-sm font-normal text-subtle">{count}</span>}
    </h2>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 border border-dashed border-border p-6 text-muted">{children}</p>;
}

export default async function StagePage({ params }: PageProps<"/roadmap/[id]">) {
  const { id } = await params;
  const roadmap = getRoadmap();
  const index = roadmap.findIndex((stage) => stage.id === id);
  const stage = roadmap[index];
  if (!stage) notFound();

  const progress = stageProgress(stage);
  const current = currentTopic(stage);
  const courses = getCredentials().filter((c) => c.stageId === stage.id);
  const projects = getProjects().filter((p) => p.stage === stage.id);
  const posts = getAllPosts().filter((post) => post.stage === stage.id);
  const prev = roadmap[index - 1];
  const next = roadmap[index + 1];

  return (
    <article className={`${containerClass} max-w-4xl py-12 sm:py-16`}>
      <Link href="/roadmap" className="inline-flex items-center gap-1.5 py-2 font-mono text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Lộ trình học
      </Link>

      <header className="mt-6 border-b-2 border-fg pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-subtle">
            Giai đoạn {String(index + 1).padStart(2, "0")} / {String(roadmap.length).padStart(2, "0")}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-xs ${
              stage.status === "next" ? "border-border text-subtle" : "border-accent text-accent"
            }`}
          >
            <StatusIcon status={stage.status} className="size-3.5" />
            {ROADMAP_STATUS_LABELS[stage.status]}
          </span>
        </div>
        <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-fg sm:text-5xl">{stage.title}</h1>
        {stage.description && <p className="mt-4 text-xl leading-relaxed text-muted">{stage.description}</p>}
      </header>

      {/* Tiến độ */}
      <section aria-label="Tiến độ" className="mt-8 border-2 border-fg bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-5xl font-semibold tracking-tight text-fg">{progress.percent}%</p>
            <p className="mt-1 font-mono text-sm text-muted">
              Đã học xong {progress.done}/{progress.total} chủ đề
            </p>
          </div>
          {current && (
            <p className="border border-accent bg-accent-soft px-3 py-2 text-fg">
              <span className="text-accent">Đang học:</span> <strong className="font-semibold">{current}</strong>
            </p>
          )}
        </div>
        <ProgressBar percent={progress.percent} label={`Tiến độ ${stage.title}`} className="mt-5 h-2.5" />
      </section>

      {/* Checklist chủ đề */}
      <section aria-labelledby="noi-dung" className="mt-12">
        <SectionTitle id="noi-dung" title="Nội dung học" />
        {stage.topics.length === 0 ? (
          <Empty>Chưa có chủ đề nào — thêm trong content/roadmap.json.</Empty>
        ) : (
          <ol className="mt-4 divide-y divide-border border border-border bg-surface">
            {stage.topics.map((topic, i) => {
              const isCurrent = topic.name === current;
              const state = topic.done ? "Đã xong" : isCurrent ? "Đang học" : "Chưa học";
              return (
                <li key={`${i}-${topic.name}`} className={`flex items-center gap-3 px-4 py-3.5 ${isCurrent ? "bg-accent-soft" : ""}`}>
                  {topic.done ? (
                    <CircleCheck className="size-5 shrink-0 text-accent" aria-hidden />
                  ) : isCurrent ? (
                    <CircleDot className="size-5 shrink-0 text-accent" aria-hidden />
                  ) : (
                    <Circle className="size-5 shrink-0 text-subtle" aria-hidden />
                  )}
                  <span className={`flex-1 ${topic.done || isCurrent ? "text-fg" : "text-muted"} ${isCurrent ? "font-semibold" : ""}`}>
                    {topic.name}
                  </span>
                  <span className={`font-mono text-xs ${topic.done || isCurrent ? "text-accent" : "text-subtle"}`}>{state}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Khoá học & chứng chỉ */}
      <section aria-labelledby="khoa-hoc" className="mt-12">
        <SectionTitle id="khoa-hoc" title="Khoá học & chứng chỉ" count={courses.length} />
        {courses.length === 0 ? (
          <Empty>
            Chưa gắn khoá học nào. Trong content/credentials.json, đặt <code className="font-mono">stageId</code> là{" "}
            <code className="font-mono text-fg">&quot;{stage.id}&quot;</code>.
          </Empty>
        ) : (
          <ul className="mt-4 grid gap-4">
            {courses.map((item, i) => (
              <li key={`${i}-${item.title}`}>
                <CredentialCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Dự án */}
      {projects.length > 0 && (
        <section aria-labelledby="du-an" className="mt-12">
          <SectionTitle id="du-an" title="Dự án áp dụng" count={projects.length} />
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Ghi chú liên quan */}
      <section aria-labelledby="ghi-chu" className="mt-12">
        <SectionTitle id="ghi-chu" title="Ghi chú trong giai đoạn này" count={posts.length} />
        {posts.length === 0 ? (
          <Empty>
            Chưa có ghi chú nào. Khi viết bài, thêm <code className="font-mono">stage: {stage.id}</code> vào frontmatter.
          </Empty>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Điều hướng giai đoạn */}
      <nav aria-label="Giai đoạn khác" className="mt-14 grid gap-3 border-t-2 border-fg pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={stageHref(prev.id)} className="group border border-border p-4 transition-colors hover:border-fg">
            <span className="inline-flex items-center gap-1 font-mono text-xs text-subtle">
              <ArrowLeft className="size-3.5" aria-hidden /> Giai đoạn trước
            </span>
            <span className="mt-1 block text-lg font-medium text-fg group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={stageHref(next.id)} className="group border border-border p-4 text-right transition-colors hover:border-fg">
            <span className="inline-flex items-center gap-1 font-mono text-xs text-subtle">
              Giai đoạn tiếp theo <ArrowRight className="size-3.5" aria-hidden />
            </span>
            <span className="mt-1 block text-lg font-medium text-fg group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
