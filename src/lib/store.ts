"use client";

// Kho nội dung phía trình duyệt (prototype): dữ liệu admin nhập được lưu trong localStorage.
// Chưa có gì trong localStorage thì dùng dữ liệu mẫu từ site.ts.

import { useSyncExternalStore } from "react";
import {
  CREDENTIAL_KINDS,
  CREDENTIAL_STATUSES,
  PROJECT_STATUSES,
  ROADMAP_STATUSES,
  parseMonth,
  credentials as seedCredentials,
  projects as seedProjects,
  roadmap as seedRoadmap,
  type Credential,
  type Project,
  type RoadmapStage,
} from "@/lib/site";

export type Note = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  content: string; // Markdown
  stageId?: string; // id giai đoạn lộ trình mà ghi chú thuộc về
};

export type ContentData = {
  roadmap: RoadmapStage[];
  credentials: Credential[];
  projects: Project[];
  notes: Note[];
};

export const seedData: ContentData = {
  roadmap: seedRoadmap,
  credentials: seedCredentials,
  projects: seedProjects,
  notes: [],
};

const DATA_KEY = "portfolio:data:v1";
const CHANGE_EVENT = "portfolio:change";

// ---------- localStorage an toàn (có thể bị chặn / đầy) ----------

export function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback); // thay đổi từ tab khác
  window.addEventListener(CHANGE_EVENT, callback); // thay đổi trong tab này
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

// ---------- Store ----------

let cachedRaw: string | null = null;
let cachedData: ContentData = seedData;

function getSnapshot(): ContentData {
  const raw = storageGet(DATA_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedData = raw ? parseContentData(JSON.parse(raw)) : seedData;
    } catch {
      cachedData = seedData;
    }
  }
  return cachedData;
}

export function useContent(): ContentData {
  return useSyncExternalStore(subscribeStorage, getSnapshot, () => seedData);
}

const noopSubscribe = () => () => {};

/** true sau khi đã chạy trên trình duyệt (đọc được localStorage). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function currentMonth(): string {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
}

/** Tháng hiện tại "MM/YYYY" trên trình duyệt; null khi render phía server (tránh lệch hydration). */
export function useCurrentMonth(): string | null {
  return useSyncExternalStore(noopSubscribe, currentMonth, () => null);
}

export function saveContent(data: ContentData) {
  if (!storageSet(DATA_KEY, JSON.stringify(data))) {
    throw new Error("Không lưu được — localStorage bị chặn hoặc đã đầy.");
  }
  notifyChange();
}

export function resetContent() {
  storageRemove(DATA_KEY);
  notifyChange();
}

// ---------- Helpers ----------

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD. */
export function today(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function toTags(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return list.map((tag) => String(tag).trim().replace(/^#/, "")).filter(Boolean);
}

export function noteReadingMinutes(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

// ---------- Kiểm tra dữ liệu import ----------

type Obj = Record<string, unknown>;

function asObject(value: unknown, where: string): Obj {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Obj;
  throw new Error(`${where}: cần là một object.`);
}

function asList(value: unknown, where: string): unknown[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  throw new Error(`"${where}" phải là một mảng.`);
}

function reqString(value: unknown, where: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(`${where}: thiếu hoặc để trống.`);
}

function optString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function monthString(value: unknown, where: string): string | undefined {
  const month = optString(value);
  if (month && parseMonth(month) === null) throw new Error(`${where}: cần dạng MM/YYYY, ví dụ 07/2026.`);
  return month;
}

function oneOf<T extends string>(value: unknown, options: readonly T[], where: string): T {
  if (options.includes(value as T)) return value as T;
  throw new Error(`${where}: phải là một trong ${options.map((o) => `"${o}"`).join(", ")}.`);
}

export function parseContentData(input: unknown): ContentData {
  const root = asObject(input, "File");

  // Dữ liệu cũ (trước khi có lộ trình trong admin) không có "roadmap" → giữ lộ trình mẫu.
  const roadmap =
    root.roadmap === undefined
      ? seedRoadmap
      : asList(root.roadmap, "roadmap").map((raw, i) => {
          const where = `roadmap[${i}]`;
          const item = asObject(raw, where);
          const status = oneOf(item.status, ROADMAP_STATUSES, `${where}.status`);
          return {
            id: optString(item.id) ?? newId(),
            title: reqString(item.title, `${where}.title`),
            status,
            description: optString(item.description),
            // Chấp nhận cả dạng chuỗi ("Embeddings") lẫn object ({ name, done })
            topics: asList(item.topics, `${where}.topics`)
              .map((topic, j) => {
                if (typeof topic === "string") return { name: topic.trim(), done: status === "done" };
                const t = asObject(topic, `${where}.topics[${j}]`);
                return { name: reqString(t.name, `${where}.topics[${j}].name`), done: Boolean(t.done) };
              })
              .filter((topic) => topic.name),
          };
        });

  const credentials = asList(root.credentials, "credentials").map((raw, i) => {
    const where = `credentials[${i}]`;
    const item = asObject(raw, where);
    return {
      title: reqString(item.title, `${where}.title`),
      issuer: reqString(item.issuer, `${where}.issuer`),
      kind: oneOf(item.kind, CREDENTIAL_KINDS, `${where}.kind`),
      status: oneOf(item.status, CREDENTIAL_STATUSES, `${where}.status`),
      date: optString(item.date) ?? "",
      url: optString(item.url),
      note: optString(item.note),
      stageId: optString(item.stageId),
      featured: item.featured === true,
    };
  });

  const projects = asList(root.projects, "projects").map((raw, i) => {
    const where = `projects[${i}]`;
    const item = asObject(raw, where);
    return {
      title: reqString(item.title, `${where}.title`),
      description: reqString(item.description, `${where}.description`),
      stack: toTags(item.stack),
      status: oneOf(item.status, PROJECT_STATUSES, `${where}.status`),
      repo: optString(item.repo),
      demo: optString(item.demo),
      startDate: monthString(item.startDate, `${where}.startDate`),
      endDate: monthString(item.endDate, `${where}.endDate`),
      featured: item.featured === true,
    };
  });

  const notes = asList(root.notes, "notes").map((raw, i) => {
    const where = `notes[${i}]`;
    const item = asObject(raw, where);
    const date = reqString(item.date, `${where}.date`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`${where}.date: cần dạng YYYY-MM-DD.`);
    return {
      id: optString(item.id) ?? newId(),
      title: reqString(item.title, `${where}.title`),
      description: optString(item.description) ?? "",
      date,
      tags: toTags(item.tags),
      content: reqString(item.content, `${where}.content`),
      stageId: optString(item.stageId),
    };
  });

  return { roadmap, credentials, projects, notes };
}

/**
 * Đọc file Markdown (có thể có frontmatter title/description/date/tags) thành ghi chú.
 * Không có title thì lấy heading "# ..." đầu tiên, rồi tới tên file.
 */
export function parseMarkdownNote(text: string, fileName: string): Note {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  const meta: Record<string, string> = {};
  let body = text;
  if (match) {
    body = match[2];
    for (const line of match[1].split(/\r?\n/)) {
      const kv = /^(\w+):\s*(.*)$/.exec(line);
      if (kv) meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  const heading = /^#\s+(.+)$/m.exec(body)?.[1]?.trim();
  const date = /^\d{4}-\d{2}-\d{2}/.exec(meta.date ?? "")?.[0] ?? today();
  const tags = toTags(
    (meta.tags ?? "")
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((tag) => tag.trim().replace(/^["']|["']$/g, "")),
  );

  return {
    id: newId(),
    title: meta.title || heading || fileName.replace(/\.(md|mdx|markdown)$/i, ""),
    description: meta.description ?? "",
    date,
    tags,
    content: body.trim(),
  };
}
