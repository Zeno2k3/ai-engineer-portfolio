import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  readingMinutes: number;
  stage?: string; // id giai đoạn lộ trình (frontmatter `stage:`)
};

export type Post = PostMeta & { content: string };

function readPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(raw);
  const date = data.date instanceof Date ? data.date : new Date(String(data.date));
  return {
    slug,
    title: String(data.title),
    description: String(data.description ?? ""),
    date: date.toISOString().slice(0, 10),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    stage: data.stage ? String(data.stage) : undefined,
    content,
  };
}

function allSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

// Chỉ trả metadata (không kèm nội dung) vì danh sách này được gửi xuống client.
export function getAllPosts(): PostMeta[] {
  return allSlugs()
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ slug, title, description, date, tags, readingMinutes, stage }) => ({
      slug,
      title,
      description,
      date,
      tags,
      readingMinutes,
      stage,
    }));
}

export function getPost(slug: string): Post | null {
  return allSlugs().includes(slug) ? readPost(slug) : null;
}
