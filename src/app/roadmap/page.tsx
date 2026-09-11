import type { Metadata } from "next";
import { ProgressBar, StageCard } from "@/components/content-sections";
import { PageHeader } from "@/components/section-heading";
import { getRoadmap } from "@/lib/content";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Lộ trình học",
  description: "Toàn bộ các giai đoạn trên hành trình AI Engineer: đang học gì, tới đâu, học khoá nào.",
  alternates: { canonical: "/roadmap" },
};

export default function RoadmapPage() {
  const roadmap = getRoadmap();
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
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader
        label="Roadmap"
        title="Lộ trình học"
        description="Toàn bộ các giai đoạn trên hành trình AI Engineer. Bấm vào từng giai đoạn để xem đang học gì, tới đâu, học khoá nào và các ghi chú."
      />

      <section aria-label="Tổng quan tiến độ" className="mb-10 border-2 border-fg bg-surface p-5 sm:p-6">
        <dl className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-xs text-muted">{stat.label}</dt>
              <dd className="mt-1 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <ProgressBar percent={percent} label="Tổng tiến độ lộ trình" className="mt-5 h-2.5" />
      </section>

      {roadmap.length === 0 ? (
        <p className="border border-dashed border-border p-8 text-center text-muted">
          Chưa có giai đoạn nào — thêm vào content/roadmap.json.
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
