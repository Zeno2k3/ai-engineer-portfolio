// Các thẻ dùng chung trên trang công khai. Không có state → render phía server (vẫn import được từ client).

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Circle,
  CircleCheck,
  CircleDot,
  ExternalLink,
  GraduationCap,
  Lock,
  Route,
} from "lucide-react";
import { ProjectTimeline } from "@/components/project-timeline";
import {
  ROADMAP_STATUS_LABELS,
  currentTopic,
  stageProgress,
  type Credential,
  type ProjectMeta,
  type RoadmapStage,
  type RoadmapStatus,
} from "@/lib/site";
import { linkClass } from "@/lib/ui";

export function ViewAll({ href, count, label = "Xem tất cả" }: { href: string; count?: number; label?: string }) {
  return (
    <Link href={href} className={`shrink-0 ${linkClass}`}>
      {label}
      {count !== undefined && ` (${count})`} <ArrowRight className="size-4" aria-hidden />
    </Link>
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
      className={`overflow-hidden border border-border bg-surface-2 ${className}`}
    >
      <div
        className="h-full w-full origin-left bg-accent transition-transform duration-(--dur-slow)"
        style={{ transform: `scaleX(${percent / 100})` }}
      />
    </div>
  );
}

export const stageHref = (id: string) => `/roadmap/${id}`;

/**
 * `showBar = false` (trang chủ): chỉ ghi "2/5 chủ đề" bằng chữ — tránh cảm giác "skills bar %"
 * mà spec khuyên không dùng; thanh tiến độ chỉ hiện ở trang Lộ trình.
 */
export function StageCard({ stage, index, showBar = true }: { stage: RoadmapStage; index: number; showBar?: boolean }) {
  const progress = stageProgress(stage);
  const current = currentTopic(stage);

  return (
    <Link
      href={stageHref(stage.id)}
      className={`group flex h-full flex-col border bg-surface p-5 transition-colors duration-(--dur-fast) hover:border-fg ${
        stage.status === "doing" ? "border-accent" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
        <span
          className={`inline-flex items-center gap-1.5 font-mono text-xs ${
            stage.status === "next" ? "text-subtle" : "text-accent"
          }`}
        >
          <StatusIcon status={stage.status} className="size-4" />
          {ROADMAP_STATUS_LABELS[stage.status]}
        </span>
      </div>
      <h3 className="mt-3 flex items-start justify-between gap-3 text-lg font-semibold text-fg">
        {stage.title}
        <ArrowUpRight
          className="mt-1 size-4 shrink-0 text-subtle transition-transform duration-(--dur-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </h3>
      {current ? (
        <p className="mt-2 leading-relaxed text-fg-soft">
          <span className="text-muted">Đang học:</span> {current}
        </p>
      ) : (
        stage.topics.length > 0 && (
          <p className="mt-2 line-clamp-2 leading-relaxed text-muted">
            {stage.topics.map((topic) => topic.name).join(" · ")}
          </p>
        )
      )}
      {progress.total > 0 && (
        <div className="mt-auto pt-4">
          <p className="flex justify-between font-mono text-xs text-subtle">
            <span>
              {progress.done}/{progress.total} chủ đề
            </span>
            {showBar && <span>{progress.percent}%</span>}
          </p>
          {showBar && <ProgressBar percent={progress.percent} label={`Tiến độ ${stage.title}`} className="mt-2 h-2" />}
        </div>
      )}
    </Link>
  );
}

// ---------- Chứng chỉ & khoá học ----------

export function CredentialCard({ item, stage }: { item: Credential; stage?: Pick<RoadmapStage, "id" | "title"> }) {
  const Icon = item.kind === "Chứng chỉ" ? Award : GraduationCap;

  return (
    <article className="flex h-full gap-4 border border-border bg-surface p-5">
      <div className="grid size-11 shrink-0 place-items-center border border-border bg-accent-soft">
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
            className={`ml-auto border px-2 py-0.5 ${
              item.status === "Hoàn thành" ? "border-accent text-accent" : "border-border text-muted"
            }`}
          >
            {item.status}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-fg">{item.title}</h3>
        <p className="mt-1 text-muted">{item.issuer}</p>
        {item.note && <p className="mt-2 leading-relaxed text-fg-soft">{item.note}</p>}
        {(stage || item.url) && (
          <div className="mt-3 flex flex-wrap gap-x-4">
            {stage && (
              <Link href={stageHref(stage.id)} className={linkClass}>
                <Route className="size-3.5" aria-hidden /> {stage.title}
              </Link>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noreferrer" className={linkClass}>
                Xác minh <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ---------- Dự án ----------

export function NdaBadge() {
  return (
    <span className="inline-flex items-center gap-1 border border-accent-2 px-2 py-0.5 font-mono text-xs text-accent-2">
      <Lock className="size-3" aria-hidden /> Confidential / NDA
    </span>
  );
}

/** Card dự án: tiêu đề là link (phủ cả card), link repo/demo nằm trên lớp phủ. */
export function ProjectCard({ project, featured = false }: { project: ProjectMeta; featured?: boolean }) {
  const metric = project.metrics[0];

  return (
    <article
      className={`group relative flex h-full flex-col border bg-surface p-5 transition-colors duration-(--dur-fast) hover:border-fg ${
        featured ? "border-fg sm:p-7" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="bg-accent-strong px-2 py-0.5 text-on-accent">{project.domain}</span>
        <span className="text-subtle">{project.status}</span>
        {project.nda && <NdaBadge />}
      </div>
      <h3 className={`mt-4 font-semibold leading-snug text-fg ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>
        <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
          {project.title}
        </Link>
      </h3>
      <div className="mt-2">
        <ProjectTimeline project={project} />
      </div>
      <p className="mt-3 leading-relaxed text-muted">{project.tagline}</p>
      {metric && (
        <p className="mt-4 flex items-baseline gap-2 border-t border-border pt-4">
          <span className="font-display text-3xl font-semibold text-fg">{metric.value}</span>
          <span className="font-mono text-xs text-subtle">
            {metric.label}
            {metric.delta && ` (${metric.delta})`}
          </span>
        </p>
      )}
      {project.stack.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Công nghệ">
          {project.stack.map((tech) => (
            <li key={tech} className="border border-border px-2 py-0.5 font-mono text-xs text-fg-soft">
              {tech}
            </li>
          ))}
        </ul>
      )}
      {!project.nda && (project.repo || project.demo) && (
        <div className="relative z-10 mt-auto flex flex-wrap gap-x-4 pt-4">
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

/** Thanh KPI lớn đầu case study, ví dụ "p99 −60%", "F1 0.91". */
export function MetricBar({ metrics }: { metrics: ProjectMeta["metrics"] }) {
  if (metrics.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 border-y-2 border-fg sm:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="border-border p-4 not-last:border-r">
          <dd className="font-display text-3xl font-semibold text-fg sm:text-4xl">{metric.value}</dd>
          <dt className="mt-1 font-mono text-xs text-subtle">
            {metric.label}
            {metric.delta && <span className="text-accent"> {metric.delta}</span>}
          </dt>
        </div>
      ))}
    </dl>
  );
}
