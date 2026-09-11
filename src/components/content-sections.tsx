"use client";

// Các thẻ + section trên trang công khai. Đọc dữ liệu từ store (localStorage, hoặc dữ liệu mẫu).

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Circle,
  CircleCheck,
  CircleDot,
  ExternalLink,
  GraduationCap,
  Route,
} from "lucide-react";
import { PostCard, PostMetaLine, TagList, type FeedItem } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import type { PostMeta } from "@/lib/posts";
import {
  ROADMAP_STATUS_LABELS,
  currentTopic,
  projectTimeline,
  stageProgress,
  type Credential,
  type Project,
  type RoadmapStage,
  type RoadmapStatus,
} from "@/lib/site";
import { noteReadingMinutes, useContent, useCurrentMonth } from "@/lib/store";

export const linkClass =
  "inline-flex w-fit items-center gap-1.5 py-1 text-sm font-medium text-accent hover:underline underline-offset-4";

// Giới hạn số mục trên trang chủ — phần còn lại xem ở trang riêng.
const HOME_LIMIT = { roadmap: 3, credentials: 4, projects: 3, posts: 3 };

/** Mục "nổi bật" lên trước, sau đó theo thứ tự trong admin (mới nhất trước), lấy tối đa `limit`. */
function pickHighlights<T extends { featured?: boolean }>(items: T[], limit: number): T[] {
  return [...items.filter((item) => item.featured), ...items.filter((item) => !item.featured)].slice(0, limit);
}

function ViewAll({ href, count, label = "Xem tất cả" }: { href: string; count: number; label?: string }) {
  return (
    <Link href={href} className={`shrink-0 ${linkClass}`}>
      {label} ({count}) <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; count: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="mb-8 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm transition-colors ${
            value === option.value
              ? "border-accent-strong bg-accent-soft font-medium text-accent"
              : "border-border text-muted hover:border-subtle hover:text-fg"
          }`}
        >
          {option.label}
          <span className="font-mono text-xs opacity-80">{option.count}</span>
        </button>
      ))}
    </div>
  );
}

// ---------- Lộ trình ----------

export function StatusIcon({ status, className = "size-5" }: { status: RoadmapStatus; className?: string }) {
  if (status === "done") return <CircleCheck className={`${className} text-accent`} aria-hidden />;
  if (status === "doing") return <CircleDot className={`${className} text-accent`} aria-hidden />;
  return <Circle className={`${className} text-subtle`} aria-hidden />;
}

export function ProgressBar({ percent, label, className = "h-1.5" }: { percent: number; label: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`overflow-hidden rounded-full bg-surface-2 ${className}`}
    >
      <div
        className="h-full w-full origin-left rounded-full bg-accent-strong transition-transform duration-500"
        style={{ transform: `scaleX(${percent / 100})` }}
      />
    </div>
  );
}

export function StageCard({ stage, index }: { stage: RoadmapStage; index: number }) {
  const progress = stageProgress(stage);
  const current = currentTopic(stage);

  return (
    <Link
      href={`/roadmap?id=${encodeURIComponent(stage.id)}`}
      className={`group flex h-full flex-col rounded-xl border bg-surface p-5 transition-colors duration-200 hover:border-accent-strong/70 ${
        stage.status === "doing" ? "border-accent-strong/50" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
            stage.status === "next" ? "text-subtle" : "text-accent"
          }`}
        >
          <StatusIcon status={stage.status} />
          {ROADMAP_STATUS_LABELS[stage.status]}
        </span>
      </div>
      <h3 className="mt-3 flex items-start justify-between gap-3 font-semibold text-fg">
        {stage.title}
        <ArrowUpRight
          className="mt-0.5 size-4 shrink-0 text-subtle transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </h3>
      {current ? (
        <p className="mt-2 text-sm leading-relaxed text-fg-soft">
          <span className="text-muted">Đang học:</span> {current}
        </p>
      ) : (
        stage.topics.length > 0 && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {stage.topics.map((topic) => topic.name).join(" · ")}
          </p>
        )
      )}
      {progress.total > 0 && (
        <div className="mt-auto pt-4">
          <div className="mb-2 flex justify-between font-mono text-xs text-subtle">
            <span>
              {progress.done}/{progress.total} chủ đề
            </span>
            <span>{progress.percent}%</span>
          </div>
          <ProgressBar percent={progress.percent} label={`Tiến độ ${stage.title}`} />
        </div>
      )}
    </Link>
  );
}

const STATUS_PRIORITY: Record<RoadmapStatus, number> = { doing: 0, next: 1, done: 2 };

export function RoadmapSection() {
  const { roadmap } = useContent();
  if (roadmap.length === 0) return null;

  // Trang chủ: ưu tiên giai đoạn đang học, rồi sắp tới — số thứ tự vẫn theo toàn bộ lộ trình.
  const shown = roadmap
    .map((stage, index) => ({ stage, index }))
    .sort((a, b) => STATUS_PRIORITY[a.stage.status] - STATUS_PRIORITY[b.stage.status] || a.index - b.index)
    .slice(0, HOME_LIMIT.roadmap);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16" aria-labelledby="lo-trinh">
      <SectionHeading
        label="Roadmap"
        title="Lộ trình học"
        id="lo-trinh"
        action={<ViewAll href="/roadmap" count={roadmap.length} label="Toàn bộ lộ trình" />}
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(({ stage, index }) => (
          <li key={stage.id}>
            <StageCard stage={stage} index={index} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Các dòng "→ Đang học: …" trong khung terminal ở hero. */
export function LearningNow() {
  const { roadmap } = useContent();
  return (
    <>
      {roadmap
        .filter((stage) => stage.status === "doing")
        .map((stage) => (
          <span key={stage.id}>
            <span className="text-accent">→</span> Đang học: {stage.title}{" "}
            <span className="text-subtle">[{stageProgress(stage).percent}%]</span>
            {"\n"}
          </span>
        ))}
    </>
  );
}

// ---------- Chứng chỉ & khoá học ----------

export function CredentialCard({ item, showStage = true }: { item: Credential; showStage?: boolean }) {
  const { roadmap } = useContent();
  const stage = showStage && item.stageId ? roadmap.find((s) => s.id === item.stageId) : undefined;
  const Icon = item.kind === "Chứng chỉ" ? Award : GraduationCap;

  return (
    <article className="flex h-full gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent-soft">
        <Icon className="size-5 text-accent" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-subtle">
          <span>{item.kind}</span>
          {item.date && (
            <>
              <span aria-hidden>·</span>
              <span>{item.date}</span>
            </>
          )}
          <span
            className={`ml-auto rounded-full px-2 py-0.5 font-sans font-medium ${
              item.status === "Hoàn thành" ? "bg-accent-soft text-accent" : "border border-border text-muted"
            }`}
          >
            {item.status}
          </span>
        </div>
        <h3 className="mt-2 font-semibold leading-snug text-fg">{item.title}</h3>
        <p className="mt-1 text-sm text-muted">{item.issuer}</p>
        {item.note && <p className="mt-2 text-sm leading-relaxed text-fg-soft">{item.note}</p>}
        {(stage || item.url) && (
          <div className="mt-3 flex flex-wrap gap-x-4">
            {stage && (
              <Link href={`/roadmap?id=${encodeURIComponent(stage.id)}`} className={linkClass}>
                <Route className="size-3.5" aria-hidden /> {stage.title}
              </Link>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className={linkClass}>
                Xem <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function CredentialsSection() {
  const { credentials } = useContent();
  if (credentials.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-5 py-16" aria-labelledby="chung-chi">
      <SectionHeading
        label="Certificates"
        title="Chứng chỉ & Khoá học"
        id="chung-chi"
        action={<ViewAll href="/certificates" count={credentials.length} />}
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {pickHighlights(credentials, HOME_LIMIT.credentials).map((item, i) => (
          <li key={`${i}-${item.title}`}>
            <CredentialCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Dự án ----------

export function ProjectCard({ project }: { project: Project }) {
  const timeline = projectTimeline(project, useCurrentMonth());

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-5">
      <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
        {project.status}
      </span>
      <h3 className="mt-4 font-semibold leading-snug text-fg">{project.title}</h3>
      {timeline && (
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 font-mono text-xs text-subtle">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          <span>{timeline.range}</span>
          {timeline.duration && (
            <>
              <span aria-hidden>·</span>
              <span className="text-fg-soft">{timeline.duration}</span>
            </>
          )}
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
      {project.stack.length > 0 && (
        <p className="mt-4 font-mono text-xs text-subtle">{project.stack.join(" / ")}</p>
      )}
      {(project.repo || project.demo) && (
        <div className="mt-auto flex flex-wrap gap-x-4 pt-4">
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noreferrer" className={linkClass}>
              Source code <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer" className={linkClass}>
              Demo <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export function ProjectsSection() {
  const { projects } = useContent();
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-5 py-16" aria-labelledby="du-an">
      <SectionHeading
        label="Projects"
        title="Dự án"
        id="du-an"
        action={<ViewAll href="/projects" count={projects.length} />}
      />
      <ul className="grid gap-4 md:grid-cols-3">
        {pickHighlights(projects, HOME_LIMIT.projects).map((project, i) => (
          <li key={`${i}-${project.title}`}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Blog ----------

// Gộp bài MDX (từ server) với ghi chú admin (từ localStorage), mới nhất lên đầu.
export function useFeed(posts: PostMeta[]): FeedItem[] {
  const { notes } = useContent();
  return useMemo(
    () =>
      [
        ...posts.map((post) => ({
          key: `post-${post.slug}`,
          href: `/blog/${post.slug}`,
          title: post.title,
          description: post.description,
          date: post.date,
          tags: post.tags,
          readingMinutes: post.readingMinutes,
          stageId: post.stage,
        })),
        ...notes.map((note) => ({
          key: `note-${note.id}`,
          href: `/note?id=${encodeURIComponent(note.id)}`,
          title: note.title,
          description: note.description,
          date: note.date,
          tags: note.tags,
          readingMinutes: noteReadingMinutes(note.content),
          stageId: note.stageId,
        })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [posts, notes],
  );
}

export function FeedCount({ posts }: { posts: PostMeta[] }) {
  return <>{useFeed(posts).length}</>;
}

export function LatestPosts({ posts }: { posts: PostMeta[] }) {
  const feed = useFeed(posts);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16" aria-labelledby="bai-moi">
      <SectionHeading
        label="Blog"
        title="Ghi chú mới nhất"
        id="bai-moi"
        action={<ViewAll href="/blog" count={feed.length} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {feed.slice(0, HOME_LIMIT.posts).map((item) => (
          <PostCard key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
}

export function BlogFeed({ posts }: { posts: PostMeta[] }) {
  const feed = useFeed(posts);

  return (
    <>
      <p className="mt-4 text-lg text-muted">
        Những gì mình học được về AI Engineering — viết lại theo cách mình hiểu. {feed.length} bài
        viết.
      </p>
      <ul className="mt-12 divide-y divide-border border-y border-border">
        {feed.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="group block py-6">
              <PostMetaLine date={item.date} readingMinutes={item.readingMinutes} />
              <h2 className="mt-2 text-xl font-semibold text-fg transition-colors group-hover:text-accent">
                {item.title}
              </h2>
              {item.description && <p className="mt-2 leading-relaxed text-muted">{item.description}</p>}
              <div className="mt-3">
                <TagList tags={item.tags} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
