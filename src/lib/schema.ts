// Schema kiểm tra nội dung trong thư mục content/ — dùng khi build (đọc file) và khi trang admin ghi file.
// Sai định dạng thì build dừng lại và báo rõ file + trường nào sai.

import { z } from "zod";
import {
  CREDENTIAL_KINDS,
  CREDENTIAL_STATUSES,
  PROJECT_DOMAINS,
  PROJECT_STATUSES,
  ROADMAP_STATUSES,
  parseMonth,
} from "@/lib/site";

// Thông báo lỗi mặc định của zod bằng tiếng Việt.
z.config(z.locales.vi());

// Chuỗi rỗng (ô để trống trong form / JSON) được coi như "không nhập".
const blank = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), schema);

const text = z.string().trim().min(1, "không được để trống");
const optText = blank(z.string().trim().optional());
const optUrl = blank(z.url("cần là URL đầy đủ, ví dụ https://…").optional());
const month = z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "cần dạng MM/YYYY, ví dụ 07/2026");
const optMonth = blank(month.optional());
const flag = z.boolean().default(false);

// gray-matter đọc `date: 2026-09-08` (không có ngoặc) thành Date → đưa về chuỗi YYYY-MM-DD.
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "cần dạng YYYY-MM-DD"),
);

// Nhận cả mảng lẫn chuỗi "a, b, #c".
const tagList = z.preprocess(
  (value) => (value === undefined ? [] : typeof value === "string" ? value.split(",") : value),
  z.array(z.string().trim().transform((tag) => tag.replace(/^#/, ""))).transform((tags) => tags.filter(Boolean)),
);

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "chỉ gồm chữ thường không dấu, số và dấu gạch ngang");

// ---------- Hồ sơ cá nhân (content/profile.json) ----------

// Ô để trống vẫn giữ chuỗi rỗng (khác optText) để hình dạng file JSON luôn ổn định.
const blankOrUrl = z.union([z.literal(""), z.url("cần là URL đầy đủ, ví dụ https://…")]).default("");

export const profileSchema = z.object({
  name: text, // tên hiện ở header, footer, trang Giới thiệu
  handle: text, // định danh ngắn, ví dụ "minhquan" → hiện dạng @minhquan
  role: text, // chức danh 1 dòng
  headline: text, // câu mở đầu ở trang chủ và ảnh OG
  title: text, // tiêu đề trang mặc định (<title>, RSS)
  description: text, // mô tả site cho SEO / RSS / llms.txt
  email: z.string().trim().default(""), // hiện khi form liên hệ lỗi; để trống là ẩn
  cvUrl: z.string().trim().default(""), // ví dụ "/cv.pdf" (file trong public/); để trống là ẩn nút tải CV
  availability: z.object({ open: flag, label: text }),
  socials: z.object({ github: blankOrUrl, linkedin: blankOrUrl }),
  about: z.object({
    bio: z.array(text).default([]), // mỗi phần tử là một đoạn văn
    timeline: z.array(z.object({ period: text, title: text, impact: text })).default([]),
  }),
});

// ---------- Lộ trình (content/roadmap.json) ----------

export const stageSchema = z.object({
  id: slugSchema,
  title: text,
  status: z.enum(ROADMAP_STATUSES),
  description: optText,
  topics: z.array(z.object({ name: text, done: flag })).default([]),
});

export const roadmapSchema = z.array(stageSchema).superRefine((stages, ctx) => {
  const seen = new Set<string>();
  stages.forEach((stage, i) => {
    if (seen.has(stage.id)) ctx.addIssue({ code: "custom", path: [i, "id"], message: `id "${stage.id}" bị trùng` });
    seen.add(stage.id);
  });
});

// ---------- Chứng chỉ & khoá học (content/credentials.json) ----------

export const credentialSchema = z.object({
  title: text,
  issuer: text,
  kind: z.enum(CREDENTIAL_KINDS),
  status: z.enum(CREDENTIAL_STATUSES),
  date: optMonth, // tháng hoàn thành hoặc bắt đầu
  url: optUrl, // link xác minh chứng chỉ / trang khoá học
  note: optText, // 1 câu: học được gì
  stageId: optText, // id giai đoạn lộ trình
  featured: flag,
});

export const credentialsSchema = z.array(credentialSchema);

// ---------- Dự án (content/work/<slug>.mdx) ----------

export const metricSchema = z.object({ label: text, value: text, delta: optText });

export const projectSchema = z
  .object({
    title: text,
    tagline: text, // 1 câu mô tả, hiện trên card
    domain: z.enum(PROJECT_DOMAINS),
    status: z.enum(PROJECT_STATUSES),
    stack: tagList,
    startDate: optMonth,
    endDate: optMonth, // để trống nếu đang làm
    repo: optUrl,
    demo: optUrl,
    paper: optUrl,
    nda: flag, // dự án không công khai: ẩn repo, chỉ mô tả ở mức trừu tượng
    featured: flag, // ưu tiên hiện trên trang chủ
    stage: optText, // id giai đoạn lộ trình
    metrics: z.array(metricSchema).default([]), // số liệu thật, ví dụ { label: "Hit rate", value: "0.82" }
  })
  .refine((p) => !p.endDate || parseMonth(p.startDate) !== null, {
    path: ["startDate"],
    message: "có endDate thì cần startDate",
  })
  .refine((p) => !p.endDate || (parseMonth(p.endDate) ?? 0) >= (parseMonth(p.startDate) ?? 0), {
    path: ["endDate"],
    message: "endDate phải sau startDate",
  });

// ---------- Bài viết (content/blog/<slug>.mdx) ----------

export const postSchema = z.object({
  title: text.max(110, "tối đa 110 ký tự (giới hạn headline của Google)"),
  description: z.string().trim().max(200, "tối đa 200 ký tự").default(""),
  date: isoDate,
  updated: isoDate.optional(),
  draft: flag, // bài nháp chỉ hiện khi chạy local
  tags: tagList,
  stage: optText, // id giai đoạn lộ trình
  series: optText, // tên series nhiều phần
  seriesPart: z.number().int().positive().optional(),
  math: flag, // bật công thức KaTeX ($…$)
});

// ---------- Trang /now (content/now.mdx) ----------

export const nowSchema = z.object({ updated: isoDate });

// ---------- Kiểu dữ liệu ----------

export type Profile = z.output<typeof profileSchema>;
export type TimelineItem = Profile["about"]["timeline"][number];
export type RoadmapStage = z.output<typeof stageSchema>;
export type RoadmapTopic = RoadmapStage["topics"][number];
export type Credential = z.output<typeof credentialSchema>;
export type ProjectMetric = z.output<typeof metricSchema>;
export type ProjectFrontmatter = z.output<typeof projectSchema>;
export type ProjectMeta = ProjectFrontmatter & { slug: string };
export type Project = ProjectMeta & { body: string };
export type PostFrontmatter = z.output<typeof postSchema>;

export function formatZodError(error: z.ZodError): string {
  return z.prettifyError(error);
}
