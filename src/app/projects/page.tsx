import type { Metadata } from "next";
import { ProjectsList } from "@/components/list-pages";
import { PageHeader } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Các dự án AI mình xây trong quá trình học.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
      <PageHeader
        label="Projects"
        title="Dự án"
        description="Những thứ mình xây để áp dụng kiến thức — từ ý tưởng, đang làm đến đã hoàn thành."
      />
      <ProjectsList />
    </div>
  );
}
