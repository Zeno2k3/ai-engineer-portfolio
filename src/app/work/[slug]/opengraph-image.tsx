import { getProject, getProjects } from "@/lib/content";
import { renderOg } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = "Ảnh bìa dự án";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  return renderOg({
    eyebrow: project ? `CASE STUDY · ${project.domain}` : "CASE STUDY",
    title: project?.title ?? site.name,
    subtitle: project?.tagline,
  });
}
