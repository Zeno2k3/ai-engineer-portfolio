"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Download, KeyRound, LogOut, RotateCcw, TriangleAlert, Upload } from "lucide-react";
import { CredentialsEditor, NotesEditor, ProjectsEditor, RoadmapEditor } from "@/components/admin/editors";
import { Button, TextField, buttonClass } from "@/components/admin/ui";
import { createPassword, login, logout, resetPassword, useAdminStatus } from "@/lib/admin-auth";
import {
  parseContentData,
  resetContent,
  saveContent,
  today,
  useContent,
  type ContentData,
} from "@/lib/store";

export function AdminApp() {
  const status = useAdminStatus();

  if (status === "loading") {
    return <p className="mx-auto max-w-md px-5 py-24 text-center text-muted">Đang tải…</p>;
  }
  if (status === "setup") return <SetupForm />;
  if (status === "locked") return <LoginForm />;
  return <Dashboard />;
}

// ---------- Đăng nhập ----------

function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <div className="grid size-11 place-items-center rounded-lg bg-accent-soft">
          <KeyRound className="size-5 text-accent" aria-hidden />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

function SetupForm() {
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const password = String(fd.get("password"));
    if (password.length < 4) return setError("Mật khẩu cần ít nhất 4 ký tự.");
    if (password !== String(fd.get("confirm"))) return setError("Hai mật khẩu không khớp.");
    createPassword(password);
  }

  return (
    <AuthCard
      title="Tạo mật khẩu admin"
      description="Lần đầu vào trang quản trị. Mật khẩu được lưu trên trình duyệt này (bản prototype)."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Mật khẩu" name="password" type="password" required autoComplete="new-password" autoFocus />
        <TextField label="Nhập lại mật khẩu" name="confirm" type="password" required autoComplete="new-password" />
        <FormError message={error} />
        <Button type="submit" className="h-11 w-full">
          Tạo & vào trang quản trị
        </Button>
      </form>
    </AuthCard>
  );
}

function LoginForm() {
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password"));
    if (!login(password)) setError("Mật khẩu không đúng.");
  }

  function forgot() {
    if (window.confirm("Xoá mật khẩu hiện tại để tạo mật khẩu mới? Dữ liệu nội dung vẫn được giữ nguyên.")) {
      resetPassword();
    }
  }

  return (
    <AuthCard title="Đăng nhập admin" description="Nhập mật khẩu để quản lý nội dung portfolio.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Mật khẩu" name="password" type="password" required autoComplete="current-password" autoFocus />
        <FormError message={error} />
        <Button type="submit" className="h-11 w-full">
          Đăng nhập
        </Button>
        <button type="button" onClick={forgot} className="w-full cursor-pointer py-2 text-sm text-muted hover:text-fg">
          Quên mật khẩu?
        </button>
      </form>
    </AuthCard>
  );
}

// ---------- Dashboard ----------

const TABS = [
  { id: "roadmap", label: "Lộ trình học" },
  { id: "credentials", label: "Chứng chỉ & Khoá học" },
  { id: "notes", label: "Ghi chú" },
  { id: "projects", label: "Dự án" },
  { id: "backup", label: "Sao lưu & Import" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type Message = { type: "ok" | "error"; text: string } | null;

function Dashboard() {
  const data = useContent();
  const [tab, setTab] = useState<TabId>("roadmap");
  const [message, setMessage] = useState<Message>(null);

  function flash(text: string, type: "ok" | "error" = "ok") {
    setMessage({ type, text });
  }

  function update(patch: Partial<ContentData>) {
    try {
      saveContent({ ...data, ...patch });
      flash("Đã lưu thay đổi.");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Lỗi không xác định.", "error");
    }
  }

  const counts: Record<TabId, number | null> = {
    roadmap: data.roadmap.length,
    credentials: data.credentials.length,
    notes: data.notes.length,
    projects: data.projects.length,
    backup: null,
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg">Quản lý nội dung</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/" className={buttonClass("secondary")}>
            Xem trang
          </Link>
          <Button variant="ghost" onClick={logout}>
            <LogOut className="size-4" aria-hidden /> Đăng xuất
          </Button>
        </div>
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-fg-soft">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        <p>
          <strong className="text-fg">Bản prototype:</strong> dữ liệu và mật khẩu lưu trong localStorage của trình duyệt
          này. Người khác truy cập site sẽ <strong className="text-fg">không</strong> thấy thay đổi, và xoá dữ liệu trình
          duyệt sẽ mất hết — nhớ <em>Export</em> để sao lưu.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Loại nội dung"
        className="mt-8 flex gap-1 overflow-x-auto border-b border-border"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="admin-panel"
            onClick={() => {
              setTab(t.id);
              setMessage(null);
            }}
            className={`-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id ? "border-accent-strong text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t.label}
            {counts[t.id] !== null && (
              <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted">
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`min-h-6 py-3 text-sm font-medium ${
          message?.type === "error" ? "text-red-600 dark:text-red-400" : "text-accent"
        }`}
      >
        {message?.text}
      </p>

      <div role="tabpanel" id="admin-panel" aria-labelledby={`tab-${tab}`}>
        {tab === "roadmap" && <RoadmapEditor items={data.roadmap} onChange={(roadmap) => update({ roadmap })} />}
        {tab === "credentials" && (
          <CredentialsEditor
            items={data.credentials}
            stages={data.roadmap}
            onChange={(credentials) => update({ credentials })}
          />
        )}
        {tab === "notes" && (
          <NotesEditor
            items={data.notes}
            stages={data.roadmap}
            onChange={(notes) => update({ notes })}
            onMessage={flash}
          />
        )}
        {tab === "projects" && <ProjectsEditor items={data.projects} onChange={(projects) => update({ projects })} />}
        {tab === "backup" && <BackupPanel data={data} onMessage={flash} />}
      </div>
    </div>
  );
}

// ---------- Sao lưu & Import ----------

const SAMPLE_JSON = `{
  "roadmap": [
    {
      "id": "rag",                // dùng để gắn ghi chú vào giai đoạn
      "title": "RAG & Vector Database",
      "status": "doing",          // "done" = Đã học | "doing" = Đang học | "next" = Sắp tới
      "description": "Cho LLM đọc tài liệu riêng",
      "topics": [
        { "name": "Embeddings", "done": true },
        { "name": "Chunking", "done": false }
      ]
    }
  ],
  "credentials": [
    {
      "title": "Machine Learning Specialization",
      "issuer": "Coursera",
      "kind": "Chứng chỉ",        // hoặc "Khoá học"
      "status": "Hoàn thành",     // hoặc "Đang học"
      "date": "06/2026",
      "url": "https://...",       // không bắt buộc
      "note": "Học được gì",      // không bắt buộc
      "stageId": "rag",           // gắn vào giai đoạn lộ trình (không bắt buộc)
      "featured": true            // ưu tiên hiện trên trang chủ
    }
  ],
  "projects": [
    {
      "title": "DocChat",
      "description": "Chatbot RAG...",
      "stack": ["Python", "FastAPI"],
      "status": "Đang làm",       // "Hoàn thành" | "Ý tưởng"
      "repo": "https://github.com/...",
      "startDate": "07/2026",     // MM/YYYY
      "endDate": "09/2026",       // bỏ trống nếu vẫn đang làm
      "featured": true
    }
  ],
  "notes": [
    {
      "title": "Ghi chú về embeddings",
      "description": "Mô tả ngắn",
      "date": "2026-09-11",
      "tags": ["rag", "embeddings"],
      "stageId": "rag",           // không bắt buộc
      "content": "## Markdown ở đây"
    }
  ]
}`;

function BackupPanel({
  data,
  onMessage,
}: {
  data: ContentData;
  onMessage: (text: string, type?: "ok" | "error") => void;
}) {
  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfolio-data-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onMessage("Đã tải file sao lưu.");
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = parseContentData(JSON.parse(await file.text()));
      const summary = `${parsed.roadmap.length} giai đoạn lộ trình, ${parsed.credentials.length} chứng chỉ/khoá học, ${parsed.projects.length} dự án, ${parsed.notes.length} ghi chú`;
      if (!window.confirm(`Thay toàn bộ dữ liệu hiện tại bằng file này (${summary})?`)) return;
      saveContent(parsed);
      onMessage(`Đã import: ${summary}.`);
    } catch (err) {
      const reason = err instanceof SyntaxError ? "File không phải JSON hợp lệ." : err instanceof Error ? err.message : "";
      onMessage(`Import thất bại. ${reason}`, "error");
    }
  }

  function reset() {
    if (!window.confirm("Xoá mọi thay đổi và quay về dữ liệu mẫu? Hãy Export trước nếu cần giữ lại.")) return;
    resetContent();
    onMessage("Đã khôi phục dữ liệu mẫu.");
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section className="flex flex-col rounded-xl border border-border bg-surface p-5">
        <h3 className="font-semibold text-fg">Export</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          Tải toàn bộ nội dung về một file JSON để sao lưu hoặc chuyển sang máy khác.
        </p>
        <Button onClick={exportJson} className="mt-4 w-full">
          <Download className="size-4" aria-hidden /> Tải file JSON
        </Button>
      </section>

      <section className="flex flex-col rounded-xl border border-border bg-surface p-5">
        <h3 className="font-semibold text-fg">Import JSON</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          Nạp file JSON đã export (hoặc tự soạn theo mẫu bên dưới). Dữ liệu hiện tại sẽ bị thay thế.
        </p>
        <label className={buttonClass("secondary", "mt-4 w-full")}>
          <Upload className="size-4" aria-hidden /> Chọn file JSON
          <input type="file" accept=".json,application/json" className="sr-only" onChange={importJson} />
        </label>
      </section>

      <section className="flex flex-col rounded-xl border border-border bg-surface p-5">
        <h3 className="font-semibold text-fg">Khôi phục mẫu</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          Xoá mọi thay đổi trong admin, quay về dữ liệu mẫu ban đầu trong code.
        </p>
        <Button variant="secondary" onClick={reset} className="mt-4 w-full">
          <RotateCcw className="size-4" aria-hidden /> Khôi phục
        </Button>
      </section>

      <details className="rounded-xl border border-border bg-surface p-5 md:col-span-3">
        <summary className="cursor-pointer font-semibold text-fg">Định dạng file JSON</summary>
        <p className="mt-3 text-sm text-muted">
          Có thể bỏ bớt mục nào không cần. Ghi chú dạng Markdown còn có thể nhập trực tiếp bằng nút “Nhập file .md” ở
          tab Ghi chú (hỗ trợ frontmatter title / description / date / tags).
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg p-4 font-mono text-xs leading-relaxed text-fg-soft">
          {SAMPLE_JSON}
        </pre>
      </details>
    </div>
  );
}
