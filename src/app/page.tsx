import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard, StageCard, ViewAll } from "@/components/content-sections";
import { JsonLd } from "@/components/json-ld";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { getProjects, getRoadmap } from "@/lib/content";
import { absoluteUrl, personLd } from "@/lib/jsonld";
import { getAllPosts } from "@/lib/posts";
import { site, stageProgress, type RoadmapStatus } from "@/lib/site";
import { buttonPrimary, buttonSecondary, containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} — RSS` }] },
  },
};

const STATUS_PRIORITY: Record<RoadmapStatus, number> = { doing: 0, next: 1, done: 2 };

/** Mục "nổi bật" lên trước, sau đó theo thứ tự sẵn có, lấy tối đa `limit`. */
function pickFeatured<T extends { featured: boolean }>(items: T[], limit: number): T[] {
  return [...items.filter((item) => item.featured), ...items.filter((item) => !item.featured)].slice(0, limit);
}

export default function HomePage() {
  const posts = getAllPosts();
  const roadmap = getRoadmap();
  const projects = getProjects();

  const featured = pickFeatured(projects, 3);
  const learning = roadmap.filter((stage) => stage.status === "doing");
  // Ưu tiên giai đoạn đang học, rồi sắp tới — số thứ tự vẫn theo toàn bộ lộ trình.
  const stages = roadmap
    .map((stage, index) => ({ stage, index }))
    .sort((a, b) => STATUS_PRIORITY[a.stage.status] - STATUS_PRIORITY[b.stage.status] || a.index - b.index)
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.title,
          url: absoluteUrl("/"),
          inLanguage: "vi",
          author: personLd(),
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-fg">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className={`relative ${containerClass} grid items-end gap-12 pt-16 pb-16 sm:pt-24 lg:grid-cols-[1.5fr_1fr]`}>
          <div>
            <p className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1 font-mono text-xs text-muted">
              <span className="size-2 bg-accent-strong" aria-hidden />
              {site.role}
            </p>
            <h1 className="hero-title mt-6 font-display text-hero leading-[0.92] font-semibold tracking-tight text-fg">
              {site.name}
            </h1>
            <p className="mt-6 max-w-xl text-2xl leading-snug text-fg-soft">{site.headline}</p>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted">
              Sổ tay thí nghiệm của mình: dự án kèm cách làm và kết quả đo được, ghi chú về những gì vừa học.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/work" className={buttonPrimary}>
                Xem dự án <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/blog" className={buttonSecondary}>
                Đọc blog
              </Link>
            </div>
          </div>

          {/* Khung terminal — trang trí, nhưng nội dung là thật nên vẫn để screen reader đọc được */}
          <div className="border-2 border-fg bg-surface hard-shadow-static">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3" aria-hidden>
              <span className="size-3 bg-[#ff5f57]" />
              <span className="size-3 bg-[#febc2e]" />
              <span className="size-3 bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-subtle">zsh — ~/ai-engineering</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-7 text-fg-soft" aria-label="Tóm tắt hiện tại">
              <span className="text-accent" aria-hidden>$ </span>whoami{"\n"}
              <span className="text-muted">{site.handle} · aspiring AI engineer</span>
              {"\n"}
              <span className="text-accent" aria-hidden>$ </span>cat now.txt{"\n"}
              {learning.map((stage) => (
                <span key={stage.id}>
                  <span className="text-accent" aria-hidden>→ </span>Đang học: {stage.title}{" "}
                  <span className="text-subtle">[{stageProgress(stage).percent}%]</span>
                  {"\n"}
                </span>
              ))}
              <span className="text-accent" aria-hidden>$ </span>ls notes/ | wc -l{"\n"}
              <span className="text-muted">{posts.length} bài viết</span>
              {"\n"}
              <span className="text-accent" aria-hidden>$ </span>
              <span className="caret" aria-hidden>▍</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Featured work — bento */}
      {featured.length > 0 && (
        <section className={`reveal ${containerClass} py-20`} aria-labelledby="du-an">
          <SectionHeading label="Work" title="Dự án nổi bật" id="du-an" action={<ViewAll href="/work" count={projects.length} />} />
          <ul className="grid gap-4 md:grid-cols-3">
            {featured.map((project, i) => (
              <li key={project.slug} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                <ProjectCard project={project} featured={i === 0} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lộ trình (rút gọn) */}
      {stages.length > 0 && (
        <section className={`reveal ${containerClass} py-16`} aria-labelledby="lo-trinh">
          <SectionHeading
            label="Roadmap"
            title="Lộ trình học"
            id="lo-trinh"
            action={<ViewAll href="/roadmap" count={roadmap.length} label="Toàn bộ lộ trình" />}
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map(({ stage, index }) => (
              <li key={stage.id}>
                <StageCard stage={stage} index={index} showBar={false} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Latest writing */}
      {posts.length > 0 && (
        <section className={`reveal ${containerClass} py-16`} aria-labelledby="bai-moi">
          <SectionHeading label="Writing" title="Ghi chú mới nhất" id="bai-moi" action={<ViewAll href="/blog" count={posts.length} />} />
          <div className="grid gap-4 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className={`${containerClass} pt-8 pb-24`}>
        <div className="border-2 border-fg bg-surface p-8 sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Cùng học AI nhé?</h2>
          <p className="mt-3 max-w-xl text-lg text-muted">
            Nếu bạn cũng đang học AI Engineering hoặc muốn trao đổi về dự án, cứ nhắn cho mình.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className={buttonPrimary}>
              Liên hệ <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/about" className={buttonSecondary}>
              Về mình
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
