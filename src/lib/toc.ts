import GithubSlugger from "github-slugger";

export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Lấy heading ## và ### từ MDX để dựng mục lục phía server.
 * Id được tạo bằng github-slugger — cùng thư viện rehype-slug dùng — nên khớp với id trong bài.
 */
export function getHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, "$1$2")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    // Slug mọi cấp heading (kể cả # và ####) để bộ đếm trùng tên giống hệt rehype-slug.
    const id = slugger.slug(text);
    const level = match[1].length;
    if (level === 2 || level === 3) headings.push({ id, text, level });
  }

  return headings;
}
