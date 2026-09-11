import type { Metadata } from "next";
import { ProjectsList } from "@/components/list-pages";
import { PageHeader } from "@/components/section-heading";
import { getProjects } from "@/lib/content";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Các dự án AI mình xây để áp dụng kiến thức — kèm cách làm và kết quả đo được.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader
        label="Work"
        title="Dự án"
        description="Những thứ mình xây để áp dụng kiến thức. Mỗi dự án có trang riêng: vấn đề, cách tiếp cận, đánh giá và bài học."
      />
      <ProjectsList projects={getProjects()} />
    </div>
  );
}
