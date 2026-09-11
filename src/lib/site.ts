// Toàn bộ thông tin cá nhân nằm ở đây — sửa file này là đủ để cá nhân hoá site.

export const site = {
  name: "Minh Quân",
  handle: "minhquan",
  role: "AI Engineer (đang trên hành trình)",
  title: "Minh Quân — Hành trình AI Engineer",
  description:
    "Portfolio và blog ghi lại những gì mình học được trên con đường trở thành AI Engineer: LLM, RAG, Agents, Evals và LLMOps.",
  url: "https://example.com",
  email: "you@example.com",
  socials: {
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-username",
  },
};

export const ROADMAP_STATUSES = ["done", "doing", "next"] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];
export const ROADMAP_STATUS_LABELS: Record<RoadmapStatus, string> = {
  done: "Đã học",
  doing: "Đang học",
  next: "Sắp tới",
};

export type RoadmapTopic = { name: string; done: boolean };

export type RoadmapStage = {
  id: string; // dùng trong link /roadmap?id=… và để gắn ghi chú/bài viết vào giai đoạn
  title: string;
  status: RoadmapStatus;
  description?: string;
  topics: RoadmapTopic[];
};

// Tạo danh sách chủ đề, `doneCount` chủ đề đầu tiên được đánh dấu đã học xong.
const topics = (names: string[], doneCount: number): RoadmapTopic[] =>
  names.map((name, i) => ({ name, done: i < doneCount }));

export const roadmap: RoadmapStage[] = [
  {
    id: "nen-tang",
    title: "Nền tảng",
    status: "done",
    description: "Python, xử lý dữ liệu và kiến thức ML cơ bản để hiểu các mô hình hoạt động thế nào.",
    topics: topics(["Python", "NumPy / Pandas", "Đại số tuyến tính cơ bản", "Machine Learning cơ bản"], 4),
  },
  {
    id: "llm-prompting",
    title: "LLM & Prompt Engineering",
    status: "done",
    description: "Hiểu cách LLM xử lý văn bản và cách viết prompt cho kết quả ổn định.",
    topics: topics(["Tokenization", "Context window", "Few-shot", "Structured output"], 4),
  },
  {
    id: "rag",
    title: "RAG & Vector Database",
    status: "doing",
    description: "Cho LLM đọc tài liệu riêng: chia nhỏ, nhúng vector, tìm kiếm và trả lời kèm nguồn.",
    topics: topics(["Embeddings", "Chunking", "Vector search", "Reranking", "Hybrid search"], 2),
  },
  {
    id: "agents",
    title: "Agents & Tool Use",
    status: "doing",
    description: "Để LLM gọi công cụ, tự lập kế hoạch và làm việc nhiều bước.",
    topics: topics(["Function calling", "MCP", "Agent loop", "Memory"], 1),
  },
  {
    id: "evals-llmops",
    title: "Evals & LLMOps",
    status: "next",
    description: "Đo chất lượng, theo dõi và vận hành ứng dụng LLM trên production.",
    topics: topics(["Đánh giá chất lượng", "Observability", "Chi phí & độ trễ", "Deploy"], 0),
  },
  {
    id: "fine-tuning",
    title: "Fine-tuning",
    status: "next",
    description: "Tinh chỉnh model cho tác vụ riêng và biết khi nào nên dùng thay cho RAG.",
    topics: topics(["LoRA", "Chuẩn bị dataset", "So sánh với RAG"], 0),
  },
];

export function stageProgress(stage: RoadmapStage) {
  const total = stage.topics.length;
  const done = stage.topics.filter((topic) => topic.done).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Chủ đề đang học = chủ đề chưa xong đầu tiên của giai đoạn "Đang học". */
export function currentTopic(stage: RoadmapStage): string | undefined {
  return stage.status === "doing" ? stage.topics.find((topic) => !topic.done)?.name : undefined;
}

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
export function projectTimeline(project: Project, now: string | null) {
  const start = parseMonth(project.startDate);
  if (start === null) return null;
  const ongoing = !project.endDate;
  const end = parseMonth(ongoing ? (now ?? undefined) : project.endDate);
  return {
    range: `${project.startDate} – ${ongoing ? "nay" : project.endDate}`,
    duration: end !== null && end >= start ? formatMonths(end - start + 1) : null,
  };
}

export const CREDENTIAL_KINDS = ["Chứng chỉ", "Khoá học"] as const;
export const CREDENTIAL_STATUSES = ["Hoàn thành", "Đang học"] as const;
export const PROJECT_STATUSES = ["Đang làm", "Hoàn thành", "Ý tưởng"] as const;

// Dữ liệu bên dưới là "dữ liệu mẫu" ban đầu. Sau khi chỉnh trong trang /admin,
// dữ liệu admin (lưu ở localStorage) sẽ được dùng thay thế.

export type Credential = {
  title: string;
  issuer: string; // nơi cấp / nền tảng học
  kind: (typeof CREDENTIAL_KINDS)[number];
  status: (typeof CREDENTIAL_STATUSES)[number];
  date: string; // tháng hoàn thành hoặc bắt đầu, dạng "MM/YYYY"
  url?: string; // link xác minh chứng chỉ hoặc trang khoá học
  note?: string; // 1 câu: học được gì
  stageId?: string; // id giai đoạn lộ trình mà khoá học/chứng chỉ thuộc về
  featured?: boolean; // ưu tiên hiện trên trang chủ
};

// Chứng chỉ & khoá học mẫu — thay bằng của bạn. Có `url` thì sẽ hiện nút "Xem".
export const credentials: Credential[] = [
  {
    title: "Machine Learning Specialization",
    issuer: "Coursera · DeepLearning.AI",
    kind: "Chứng chỉ",
    status: "Hoàn thành",
    date: "06/2026",
    note: "Regression, classification, neural network cơ bản.",
    stageId: "nen-tang",
    featured: true,
  },
  {
    title: "Python for Data Science",
    issuer: "Tên nền tảng",
    kind: "Chứng chỉ",
    status: "Hoàn thành",
    date: "03/2026",
    note: "NumPy, Pandas, trực quan hoá dữ liệu.",
    stageId: "nen-tang",
  },
  {
    title: "Xây dựng ứng dụng với LLM",
    issuer: "Tên nền tảng",
    kind: "Khoá học",
    status: "Đang học",
    date: "08/2026",
    note: "Prompting, RAG, function calling.",
    stageId: "rag",
  },
];

export type Project = {
  title: string;
  description: string;
  stack: string[];
  status: (typeof PROJECT_STATUSES)[number];
  repo?: string;
  demo?: string;
  startDate?: string; // "MM/YYYY"
  endDate?: string; // "MM/YYYY" — để trống nếu đang làm
  featured?: boolean; // ưu tiên hiện trên trang chủ
};

// Dự án mẫu — thay bằng dự án thật của bạn.
export const projects: Project[] = [
  {
    title: "DocChat — hỏi đáp tài liệu nội bộ",
    description:
      "Chatbot RAG đọc tài liệu PDF, chia chunk, lưu embeddings vào vector DB và trả lời kèm trích dẫn nguồn.",
    stack: ["Python", "FastAPI", "pgvector", "LLM API"],
    status: "Đang làm",
    repo: "https://github.com/your-username/docchat",
    startDate: "07/2026",
    featured: true,
  },
  {
    title: "Prompt Lab",
    description:
      "Công cụ nhỏ để so sánh nhiều phiên bản prompt trên cùng một bộ test case và chấm điểm output.",
    stack: ["TypeScript", "Next.js", "SQLite"],
    status: "Hoàn thành",
    repo: "https://github.com/your-username/prompt-lab",
    startDate: "04/2026",
    endDate: "05/2026",
  },
  {
    title: "Mini Eval Harness",
    description:
      "Bộ khung đánh giá LLM tự viết: dataset dạng JSONL, nhiều loại grader (exact match, LLM-as-judge) và báo cáo.",
    stack: ["Python", "Pytest", "Pandas"],
    status: "Ý tưởng",
  },
];
