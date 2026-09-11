"use client";

// Danh sách có bộ lọc cho /certificates và /work. Dữ liệu được server truyền vào qua props,
// chỉ phần lọc chạy phía client.

import { useState } from "react";
import { CredentialCard, ProjectCard } from "@/components/content-sections";
import { CREDENTIAL_KINDS, PROJECT_DOMAINS, type Credential, type ProjectMeta, type RoadmapStage } from "@/lib/site";

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
          className={`inline-flex h-10 cursor-pointer items-center gap-1.5 border px-4 font-mono text-sm transition-colors ${
            value === option.value
              ? "border-fg bg-accent-strong text-on-accent"
              : "border-border text-muted hover:border-fg hover:text-fg"
          }`}
        >
          {option.label}
          <span className="text-xs opacity-80">{option.count}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="border border-dashed border-border p-8 text-center text-muted">{children}</p>;
}

export function CertificatesList({ credentials, stages }: { credentials: Credential[]; stages: RoadmapStage[] }) {
  const [filter, setFilter] = useState<string>("all");
  const shown = filter === "all" ? credentials : credentials.filter((c) => c.kind === filter);

  return (
    <>
      <FilterChips
        label="Lọc theo loại"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Tất cả", count: credentials.length },
          ...CREDENTIAL_KINDS.map((kind) => ({
            value: kind,
            label: kind,
            count: credentials.filter((c) => c.kind === kind).length,
          })),
        ]}
      />
      {shown.length === 0 ? (
        <EmptyState>Chưa có mục nào ở loại này.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((item, i) => (
            <li key={`${i}-${item.title}`}>
              <CredentialCard item={item} stage={stages.find((s) => s.id === item.stageId)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function ProjectsList({ projects }: { projects: ProjectMeta[] }) {
  const [filter, setFilter] = useState<string>("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.domain === filter);
  const domains = PROJECT_DOMAINS.filter((domain) => projects.some((p) => p.domain === domain));

  return (
    <>
      <FilterChips
        label="Lọc theo lĩnh vực"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Tất cả", count: projects.length },
          ...domains.map((domain) => ({
            value: domain,
            label: domain,
            count: projects.filter((p) => p.domain === domain).length,
          })),
        ]}
      />
      {shown.length === 0 ? (
        <EmptyState>Chưa có dự án nào ở lĩnh vực này.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
