import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Route } from "lucide-react";
import { MetricBar, NdaBadge } from "@/components/content-sections";
import { JsonLd } from "@/components/json-ld";
import { MdxContent } from "@/components/mdx-content";
import { ProjectTimeline } from "@/components/project-timeline";
import { getProject, getProjects, getRoadmap } from "@/lib/content";
import { absoluteUrl, breadcrumbLd, personLd } from "@/lib/jsonld";
import { buttonPrimary, buttonSecondary, containerClass, linkClass } from "@/lib/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.tagline, url: `/work/${project.slug}`, locale: "vi_VN" },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const stage = project.stage ? getRoadmap().find((s) => s.id === project.stage) : undefined;
  const showRepo = project.repo && !project.nda;
  const jsonLd: object[] = [
    breadcrumbLd([
      { name: "Trang chủ", path: "/" },
      { name: "Dự án", path: "/work" },
      { name: project.title, path: `/work/${project.slug}` },
    ]),
  ];
  // Google không có rich result cho SoftwareSourceCode — kiểm tra bằng validator.schema.org.
  if (showRepo) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: project.title,
      description: project.tagline,
      url: absoluteUrl(`/work/${project.slug}`),
      codeRepository: project.repo,
      programmingLanguage: project.stack,
      author: personLd(),
    });
  }

  return (
    <article className={`${containerClass} py-12 sm:py-16`}>
      <JsonLd data={jsonLd} />
      <Link href="/work" className="inline-flex items-center gap-1.5 py-2 font-mono text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> Tất cả dự án
      </Link>

      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="bg-accent-strong px-2 py-0.5 text-on-accent">{project.domain}</span>
          <span className="text-subtle">{project.status}</span>
          {project.nda && <NdaBadge />}
        </div>
        <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-fg sm:text-6xl">{project.title}</h1>
        <p className="mt-5 max-w-[65ch] text-xl leading-relaxed text-fg-soft">{project.tagline}</p>
        <div className="mt-4">
          <ProjectTimeline project={project} />
        </div>
        {project.stack.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Công nghệ">
            {project.stack.map((tech) => (
              <li key={tech} className="border border-border px-2 py-0.5 font-mono text-xs text-fg-soft">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </header>

      {project.metrics.length > 0 && (
        <section aria-label="Kết quả chính" className="mt-10">
          <MetricBar metrics={project.metrics} />
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        {showRepo && (
          <a href={project.repo} target="_blank" rel="noreferrer" className={buttonPrimary}>
            Source code <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noreferrer" className={showRepo ? buttonSecondary : buttonPrimary}>
            Demo <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
        {project.paper && (
          <a href={project.paper} target="_blank" rel="noreferrer" className={buttonSecondary}>
            Paper / writeup <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
        {project.nda && (
          <p className="font-mono text-sm text-muted">
            Dự án không công khai — chi tiết theo yêu cầu qua{" "}
            <Link href="/contact" className="text-accent underline-offset-4 hover:underline">
              trang liên hệ
            </Link>
            .
          </p>
        )}
      </div>

      <div className="mt-12 max-w-3xl">
        <MdxContent source={project.body} />
      </div>

      {stage && (
        <p className="mt-12 max-w-3xl border-t-2 border-fg pt-6">
          <span className="text-muted">Thuộc giai đoạn lộ trình: </span>
          <Link href={`/roadmap/${stage.id}`} className={linkClass}>
            <Route className="size-3.5" aria-hidden /> {stage.title}
          </Link>
        </p>
      )}
    </article>
  );
}
