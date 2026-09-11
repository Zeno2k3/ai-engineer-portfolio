import type { Metadata } from "next";
import Link from "next/link";
import { stageHref } from "@/components/content-sections";
import { MdxContent } from "@/components/mdx-content";
import { PageHeader } from "@/components/section-heading";
import { getCredentials, getIdeas, getNow, getProjects, getRoadmap } from "@/lib/content";
import { currentTopic, stageProgress } from "@/lib/site";
import { containerClass } from "@/lib/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Now",
  description: "Mình đang học gì, làm gì ở thời điểm hiện tại.",
  alternates: { canonical: "/now" },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-subtle">{title}</h2>
      <ul className="mt-3 space-y-2 text-lg">{children}</ul>
    </section>
  );
}

export default function NowPage() {
  const now = getNow();
  const learning = getRoadmap().filter((stage) => stage.status === "doing");
  const building = getProjects().filter((project) => project.status === "Đang làm");
  const courses = getCredentials().filter((c) => c.status === "Đang học");
  const ideas = getIdeas();

  return (
    <div className={`${containerClass} max-w-4xl py-16 sm:py-20`}>
      <PageHeader label="Now" title="Bây giờ mình đang làm gì">
        <p className="mt-4 font-mono text-sm text-muted">
          Cập nhật lần cuối: <time dateTime={now.updated}>{formatDate(now.updated)}</time>
        </p>
      </PageHeader>

      <MdxContent source={now.content} />

      <div className="mt-12">
        {learning.length > 0 && (
          <Block title="Đang học">
            {learning.map((stage) => (
              <li key={stage.id}>
                <Link href={stageHref(stage.id)} className="font-semibold text-fg hover:text-accent">
                  {stage.title}
                </Link>
                <span className="text-muted">
                  {" "}
                  — {stageProgress(stage).done}/{stage.topics.length} chủ đề
                  {currentTopic(stage) && `, đang ở “${currentTopic(stage)}”`}
                </span>
              </li>
            ))}
          </Block>
        )}
        {building.length > 0 && (
          <Block title="Đang làm">
            {building.map((project) => (
              <li key={project.slug}>
                <Link href={`/work/${project.slug}`} className="font-semibold text-fg hover:text-accent">
                  {project.title}
                </Link>
                <span className="text-muted"> — {project.tagline}</span>
              </li>
            ))}
          </Block>
        )}
        {courses.length > 0 && (
          <Block title="Khoá học đang theo">
            {courses.map((course) => (
              <li key={course.title}>
                <span className="font-semibold text-fg">{course.title}</span>
                <span className="text-muted"> — {course.issuer}</span>
              </li>
            ))}
          </Block>
        )}
        {ideas.length > 0 && (
          <Block title="Ý tưởng tiếp theo">
            {ideas.map((idea) => (
              <li key={idea.slug}>
                <span className="font-semibold text-fg">{idea.title}</span>
                <span className="text-muted"> — {idea.tagline}</span>
              </li>
            ))}
          </Block>
        )}
      </div>
    </div>
  );
}
