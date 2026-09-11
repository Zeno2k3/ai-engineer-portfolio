import { absoluteUrl } from "@/lib/jsonld";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import { escapeXml } from "@/lib/utils";

// RSS 2.0, tạo một lần lúc build.
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(`${post.date}T00:00:00+07:00`).toUTCString()}</pubDate>`,
        `<description>${escapeXml(post.description)}</description>`,
        ...post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
        "</item>",
      ].join("");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(site.title)}</title>
<link>${absoluteUrl("/")}</link>
<description>${escapeXml(site.description)}</description>
<language>vi</language>
<atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].updated ?? posts[0].date}T00:00:00+07:00`).toUTCString()}</lastBuildDate>` : ""}
${items}
</channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
