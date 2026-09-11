import readingTime from "reading-time";
import { readMdxDir } from "@/lib/content";
import { postSchema, type PostFrontmatter } from "@/lib/schema";
import { slugify } from "@/lib/utils";

export type PostMeta = PostFrontmatter & {
  slug: string;
  readingMinutes: number;
  wordCount: number;
};

export type Post = PostMeta & { content: string };

/** Bài để admin sửa: frontmatter + nội dung gốc, kể cả bài nháp. */
export type EditablePost = PostFrontmatter & { slug: string; content: string };

// Bài nháp (draft: true) chỉ hiện khi chạy local.
const showDrafts = process.env.NODE_ENV === "development";

function readAll(): Post[] {
  return readMdxDir("blog", postSchema)
    .map(({ slug, data, content }) => {
      const stats = readingTime(content);
      return {
        ...data,
        slug,
        content,
        readingMinutes: Math.max(1, Math.ceil(stats.minutes)),
        wordCount: stats.words,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function toMeta(post: Post): PostMeta {
  const meta: Partial<Post> = { ...post };
  delete meta.content;
  return meta as PostMeta;
}

// Chỉ trả metadata (không kèm nội dung) vì danh sách này có thể được gửi xuống client.
export function getAllPosts(): PostMeta[] {
  return readAll()
    .filter((post) => showDrafts || !post.draft)
    .map(toMeta);
}

export function getPost(slug: string): Post | null {
  return readAll().find((post) => post.slug === slug && (showDrafts || !post.draft)) ?? null;
}

export function getEditablePosts(): EditablePost[] {
  return readMdxDir("blog", postSchema).map(({ slug, data, content }) => ({ ...data, slug, content }));
}

// ---------- Tag ----------

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

// ---------- Series ----------

export type Series = { slug: string; name: string; posts: PostMeta[] };

export function getAllSeries(): Series[] {
  const groups = new Map<string, PostMeta[]>();
  for (const post of getAllPosts()) {
    if (post.series) groups.set(post.series, [...(groups.get(post.series) ?? []), post]);
  }
  return [...groups].map(([name, posts]) => ({
    slug: slugify(name),
    name,
    posts: posts.sort((a, b) => (a.seriesPart ?? 0) - (b.seriesPart ?? 0) || a.date.localeCompare(b.date)),
  }));
}

export function getSeries(slug: string): Series | null {
  return getAllSeries().find((series) => series.slug === slug) ?? null;
}

// ---------- Bài liên quan ----------

/** Ưu tiên bài cùng giai đoạn lộ trình, rồi tới số tag trùng; bỏ qua bài cùng series (đã có series nav). */
export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  return getAllPosts()
    .filter((other) => other.slug !== post.slug && !(post.series && other.series === post.series))
    .map((other) => ({
      other,
      score:
        (post.stage && other.stage === post.stage ? 2 : 0) +
        other.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.other.date.localeCompare(a.other.date))
    .slice(0, limit)
    .map(({ other }) => other);
}
