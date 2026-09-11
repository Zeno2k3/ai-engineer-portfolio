import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import {
  CredentialsSection,
  FeedCount,
  LatestPosts,
  LearningNow,
  ProjectsSection,
  RoadmapSection,
} from "@/components/content-sections";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="bg-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-5 pt-20 pb-20 sm:pt-28 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent-strong" aria-hidden />
              {site.role}
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-fg sm:text-5xl">
              Xin chào, mình là <span className="text-accent">{site.name}</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Đây là nơi mình ghi lại những gì học được trên hành trình trở thành AI Engineer — từ
              LLM, RAG đến Agents — cùng các dự án mình xây trong lúc học.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-strong px-5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
              >
                Đọc blog <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/#du-an"
                className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-fg transition-colors hover:border-subtle"
              >
                Xem dự án
              </Link>
            </div>
          </div>

          {/* Terminal card (trang trí — nội dung thật nằm ở các section bên dưới) */}
          <div
            className="animate-rise overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/10 [animation-delay:120ms]"
            aria-hidden
          >
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-subtle">zsh — ~/ai-engineering</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-fg-soft">
              <span className="text-accent">$</span> whoami{"\n"}
              <span className="text-muted">{site.handle} · aspiring AI engineer</span>{"\n"}
              <span className="text-accent">$</span> cat now.txt{"\n"}
              <LearningNow />
              <span className="text-accent">$</span> ls notes/ | wc -l{"\n"}
              <span className="text-muted">
                <FeedCount posts={posts} /> bài viết
              </span>
              {"\n"}
              <span className="text-accent">$</span> <span className="caret">▍</span>
            </pre>
          </div>
        </div>
      </section>

      <RoadmapSection />
      <CredentialsSection />
      <ProjectsSection />
      <LatestPosts posts={posts} />

      {/* Contact */}
      <section className="mx-auto max-w-5xl px-5 pt-8 pb-24">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">Cùng học AI nhé?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Nếu bạn cũng đang học AI Engineering hoặc muốn trao đổi về dự án, cứ nhắn cho mình.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-strong px-5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90"
            >
              <Mail className="size-4" aria-hidden /> Gửi email
            </a>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold text-fg transition-colors hover:border-subtle"
            >
              GitHub
            </a>
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold text-fg transition-colors hover:border-subtle"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
