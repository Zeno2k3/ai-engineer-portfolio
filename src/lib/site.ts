// Thông tin cá nhân + hằng số + hàm tiện ích dùng chung (chạy được cả server lẫn client).
// Nội dung (lộ trình, chứng chỉ, dự án, bài viết) nằm trong thư mục content/ — xem src/lib/content.ts.

// Hồ sơ cá nhân sửa được ở trang /admin → tab "Giới thiệu" (ghi vào content/profile.json).
// Ở đây import thẳng file JSON (không qua fs) để dùng được cả trong client component
// như header/footer; bản có kiểm tra schema là getProfile() trong src/lib/content.ts.
import profileJson from "../../content/profile.json";
import type { Profile, ProjectFrontmatter, RoadmapStage } from "@/lib/schema";

export type {
  Profile,
  TimelineItem,
  Credential,
  Project,
  ProjectMeta,
  ProjectMetric,
  RoadmapStage,
  RoadmapTopic,
} from "@/lib/schema";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

const profile: Profile = profileJson;

export const site = {
  ...profile,
  // Domain chính thức. Chỉ dùng phía server (canonical, sitemap, RSS, JSON-LD).
  // Đặt NEXT_PUBLIC_SITE_URL khi có domain riêng; trên Vercel tự lấy domain production.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? (productionHost ? `https://${productionHost}` : "http://localhost:3000"),
};

/** Các mạng xã hội đã điền (bỏ qua mục để trống). */
export function socialLinks(socials: Profile["socials"] = site.socials): { label: string; href: string }[] {
  return [
    { label: "GitHub", href: socials.github },
    { label: "LinkedIn", href: socials.linkedin },
  ].filter((link) => link.href);
}

// ---------- Lộ trình ----------

export const ROADMAP_STATUSES = ["done", "doing", "next"] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];
export const ROADMAP_STATUS_LABELS: Record<RoadmapStatus, string> = {
  done: "Đã học",
  doing: "Đang học",
  next: "Sắp tới",
};

export function stageProgress(stage: RoadmapStage) {
  const total = stage.topics.length;
  const done = stage.topics.filter((topic) => topic.done).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Chủ đề đang học = chủ đề chưa xong đầu tiên của giai đoạn "Đang học". */
export function currentTopic(stage: RoadmapStage): string | undefined {
  return stage.status === "doing" ? stage.topics.find((topic) => !topic.done)?.name : undefined;
}

// ---------- Chứng chỉ & dự án ----------

export const CREDENTIAL_KINDS = ["Chứng chỉ", "Khoá học"] as const;
export const CREDENTIAL_STATUSES = ["Hoàn thành", "Đang học"] as const;
export const PROJECT_STATUSES = ["Đang làm", "Hoàn thành", "Ý tưởng"] as const;
export const PROJECT_DOMAINS = ["LLM", "RAG", "Agents", "Evals", "Infra", "OSS", "CV", "RL"] as const;

/** "MM/YYYY" → số thứ tự tháng (năm * 12 + tháng), hoặc null nếu sai định dạng. */
export function parseMonth(value?: string): number | null {
  const match = /^(\d{2})\/(\d{4})$/.exec(value ?? "");
  if (!match) return null;
  const month = Number(match[1]);
  return month >= 1 && month <= 12 ? Number(match[2]) * 12 + month - 1 : null;
}

function formatMonths(total: number): string {
  const years = Math.floor(total / 12);
  const months = total % 12;
  return [years > 0 && `${years} năm`, months > 0 && `${months} tháng`].filter(Boolean).join(" ");
}

/**
 * Thời gian làm dự án, ví dụ { range: "07/2026 – nay", duration: "3 tháng" }.
 * Tính cả tháng bắt đầu và tháng kết thúc. `now` là tháng hiện tại ("MM/YYYY"),
 * dùng cho dự án chưa có ngày kết thúc; null thì chưa tính được thời lượng.
 */
export function projectTimeline(project: Pick<ProjectFrontmatter, "startDate" | "endDate">, now: string | null) {
  const start = parseMonth(project.startDate);
  if (start === null) return null;
  const ongoing = !project.endDate;
  const end = parseMonth(ongoing ? (now ?? undefined) : project.endDate);
  return {
    range: `${project.startDate} – ${ongoing ? "nay" : project.endDate}`,
    duration: end !== null && end >= start ? formatMonths(end - start + 1) : null,
  };
}
