import { getProjects } from "@/lib/content";
import { absoluteUrl } from "@/lib/jsonld";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

// llms.txt (đề xuất của Jeremy Howard, 2024): bản đồ nội dung dạng Markdown cho công cụ AI.
// Google không dùng file này — chỉ là "vệ sinh" cho developer tooling, không phải kênh SEO (spec §11).
export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${site.title}`,
    "",
    `> ${site.description}`,
    "",
    "## Bài viết",
    ...getAllPosts().map((post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.description}`),
    "",
    "## Dự án",
    ...getProjects().map((project) => `- [${project.title}](${absoluteUrl(`/work/${project.slug}`)}): ${project.tagline}`),
    "",
    "## Trang khác",
    `- [Giới thiệu](${absoluteUrl("/about")})`,
    `- [Lộ trình học](${absoluteUrl("/roadmap")})`,
    `- [Now](${absoluteUrl("/now")})`,
    `- [RSS](${absoluteUrl("/rss.xml")})`,
    "",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
