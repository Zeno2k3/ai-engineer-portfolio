// Đọc nội dung từ thư mục content/ (chỉ chạy phía server, lúc build).
// Sửa nội dung = sửa file trong content/ (hoặc dùng trang /admin khi chạy local) → commit → push.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  credentialsSchema,
  formatZodError,
  nowSchema,
  projectSchema,
  roadmapSchema,
  type Credential,
  type Project,
  type ProjectMeta,
  type RoadmapStage,
} from "@/lib/schema";
import { parseMonth } from "@/lib/site";

export const CONTENT_DIR = path.join(process.cwd(), "content");

function check<T extends z.ZodType>(schema: T, value: unknown, file: string): z.output<T> {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`Nội dung không hợp lệ trong ${file}:\n${formatZodError(result.error)}`);
  return result.data;
}

function readJson<T extends z.ZodType>(file: string, schema: T): z.output<T> {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  return check(schema, JSON.parse(raw), `content/${file}`);
}

/** Đọc mọi file .mdx trong content/<dir>: frontmatter (đã kiểm tra) + nội dung. */
export function readMdxDir<T extends z.ZodType>(dir: string, schema: T) {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(full, file), "utf8"));
      return {
        slug: file.replace(/\.mdx$/, ""),
        data: check(schema, data, `content/${dir}/${file}`),
        content: content.trim(),
      };
    });
}

export function getRoadmap(): RoadmapStage[] {
  return readJson("roadmap.json", roadmapSchema);
}

export function getCredentials(): Credential[] {
  return readJson("credentials.json", credentialsSchema);
}

// ---------- Dự án ----------

const newestFirst = (a: ProjectMeta, b: ProjectMeta) =>
  (parseMonth(b.startDate) ?? -1) - (parseMonth(a.startDate) ?? -1);

/** Mọi dự án, kể cả "Ý tưởng" (dùng cho admin và trang /now). */
export function getAllProjects(): Project[] {
  return readMdxDir("work", projectSchema)
    .map(({ slug, data, content }) => ({ ...data, slug, body: content }))
    .sort(newestFirst);
}

function toMeta(project: Project): ProjectMeta {
  const meta: Partial<Project> = { ...project };
  delete meta.body;
  return meta as ProjectMeta;
}

/** Dự án công khai ở /work và trang chủ — bỏ "Ý tưởng" vì chưa có gì để chứng minh. */
export function getProjects(): ProjectMeta[] {
  return getAllProjects()
    .filter((project) => project.status !== "Ý tưởng")
    .map(toMeta);
}

export function getProject(slug: string): Project | null {
  return getAllProjects().find((project) => project.slug === slug && project.status !== "Ý tưởng") ?? null;
}

export function getIdeas(): ProjectMeta[] {
  return getAllProjects()
    .filter((project) => project.status === "Ý tưởng")
    .map(toMeta);
}

// ---------- Trang /now ----------

export function getNow() {
  const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, "now.mdx"), "utf8"));
  return { ...check(nowSchema, data, "content/now.mdx"), content: content.trim() };
}
