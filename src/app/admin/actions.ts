"use server";

// Admin ghi thẳng vào file trong content/ — CHỈ khi chạy local (npm run dev), giống chế độ local của Keystatic.
// Trên production mọi action đều bị từ chối: nội dung chỉ thay đổi qua git (commit → push → Vercel build lại).

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CONTENT_DIR } from "@/lib/content";
import { credentialsSchema, formatZodError, postSchema, projectSchema, roadmapSchema, slugSchema } from "@/lib/schema";

export type SaveResult = { ok: boolean; message: string };

const PUBLISH_HINT = "Nhớ commit & push để đưa lên site.";

async function run(task: () => Promise<string>): Promise<SaveResult> {
  try {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Trang admin chỉ ghi file khi chạy local (npm run dev).");
    }
    const message = await task();
    revalidatePath("/", "layout");
    return { ok: true, message: `${message} ${PUBLISH_HINT}` };
  } catch (err) {
    const message = err instanceof z.ZodError ? formatZodError(err) : err instanceof Error ? err.message : "Lỗi không xác định.";
    return { ok: false, message: `Chưa lưu được:\n${message}` };
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(path.join(CONTENT_DIR, file), `${JSON.stringify(data, null, 2)}\n`);
}

/** Bỏ trường rỗng / mặc định để frontmatter gọn (undefined, false, mảng rỗng). */
function clean(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== false && !(Array.isArray(value) && value.length === 0))
      .map(([key, value]) => [
        key,
        Array.isArray(value)
          ? value.map((item) => (item && typeof item === "object" ? clean(item as Record<string, unknown>) : item))
          : value,
      ]),
  );
}

type MdxEntry = { slug: string; body: string; data: Record<string, unknown> };

const serialize = (entry: MdxEntry) => matter.stringify(`\n${entry.body.trim()}\n`, clean(entry.data));

/**
 * Đồng bộ thư mục content/<dir> với danh sách mới: ghi file mới/đã sửa, xoá file không còn trong danh sách.
 * File không đổi nội dung thì không ghi lại → git diff chỉ gồm những bài thật sự sửa.
 */
async function syncMdxDir(dir: string, entries: MdxEntry[], schema: z.ZodType) {
  const slugs = entries.map((entry) => entry.slug);
  const duplicate = slugs.find((slug, i) => slugs.indexOf(slug) !== i);
  if (duplicate) throw new Error(`Slug "${duplicate}" bị trùng.`);

  const full = path.join(CONTENT_DIR, dir);
  await fs.mkdir(full, { recursive: true });

  for (const entry of entries) {
    const file = path.join(full, `${entry.slug}.mdx`);
    const next = serialize(entry);
    const current = await fs.readFile(file, "utf8").catch(() => null);
    if (current !== null) {
      const parsed = matter(current);
      const same = serialize({
        slug: entry.slug,
        body: parsed.content,
        data: schema.parse(parsed.data) as Record<string, unknown>,
      });
      if (same === next) continue;
    }
    await fs.writeFile(file, next);
  }

  for (const file of await fs.readdir(full)) {
    if (file.endsWith(".mdx") && !slugs.includes(file.slice(0, -4))) await fs.unlink(path.join(full, file));
  }
}

const mdxItem = z.looseObject({ slug: slugSchema, body: z.string() });

export async function saveRoadmap(items: unknown) {
  return run(async () => {
    await writeJson("roadmap.json", roadmapSchema.parse(items));
    return "Đã lưu content/roadmap.json.";
  });
}

export async function saveCredentials(items: unknown) {
  return run(async () => {
    await writeJson("credentials.json", credentialsSchema.parse(items));
    return "Đã lưu content/credentials.json.";
  });
}

export async function saveProjects(items: unknown) {
  return run(async () => {
    const entries = z
      .array(mdxItem)
      .parse(items)
      .map((item) => ({ slug: item.slug, body: item.body, data: projectSchema.parse(item) }));
    await syncMdxDir("work", entries, projectSchema);
    return `Đã lưu ${entries.length} dự án vào content/work/.`;
  });
}

export async function savePosts(items: unknown) {
  return run(async () => {
    const entries = z
      .array(z.looseObject({ slug: slugSchema, content: z.string() }))
      .parse(items)
      .map((item) => ({ slug: item.slug, body: item.content, data: postSchema.parse(item) }));
    await syncMdxDir("blog", entries, postSchema);
    return `Đã lưu ${entries.length} bài viết vào content/blog/.`;
  });
}
