"use client";

// Trang đầy đủ cho Chứng chỉ & Khoá học và Dự án (trang chủ chỉ hiện phần nổi bật).

import { useState } from "react";
import { CredentialCard, FilterChips, ProjectCard } from "@/components/content-sections";
import { CREDENTIAL_KINDS, PROJECT_STATUSES } from "@/lib/site";
import { useContent } from "@/lib/store";

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">{children}</p>
  );
}

export function CertificatesList() {
  const { credentials } = useContent();
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
        <EmptyState>Chưa có mục nào — thêm trong trang Admin.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((item, i) => (
            <li key={`${i}-${item.title}`}>
              <CredentialCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function ProjectsList() {
  const { projects } = useContent();
  const [filter, setFilter] = useState<string>("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <FilterChips
        label="Lọc theo trạng thái"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Tất cả", count: projects.length },
          ...PROJECT_STATUSES.map((status) => ({
            value: status,
            label: status,
            count: projects.filter((p) => p.status === status).length,
          })),
        ]}
      />
      {shown.length === 0 ? (
        <EmptyState>Chưa có dự án nào ở trạng thái này.</EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((project, i) => (
            <li key={`${i}-${project.title}`}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
