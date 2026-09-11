"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { FolderGit2 } from "lucide-react";
import { saveCredentials, savePosts, saveProjects, saveRoadmap, type SaveResult } from "@/app/admin/actions";
import { CredentialsEditor, PostsEditor, ProjectsEditor, RoadmapEditor } from "@/components/admin/editors";
import { buttonClass } from "@/components/admin/ui";
import type { EditablePost } from "@/lib/posts";
import type { Credential, Project, RoadmapStage } from "@/lib/site";

export type AdminData = {
  roadmap: RoadmapStage[];
  credentials: Credential[];
  projects: Project[];
  posts: EditablePost[];
};

type TabId = keyof AdminData;

const TABS: { id: TabId; label: string; file: string }[] = [
  { id: "roadmap", label: "Lộ trình học", file: "content/roadmap.json" },
  { id: "credentials", label: "Chứng chỉ & Khoá học", file: "content/credentials.json" },
  { id: "projects", label: "Dự án", file: "content/work/*.mdx" },
  { id: "posts", label: "Bài viết", file: "content/blog/*.mdx" },
];

const SAVE: { [K in TabId]: (items: AdminData[K]) => Promise<SaveResult> } = {
  roadmap: saveRoadmap,
  credentials: saveCredentials,
  projects: saveProjects,
  posts: savePosts,
};

type Message = { type: "ok" | "error"; text: string } | null;

export function AdminApp({ initialData }: { initialData: AdminData }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<TabId>("roadmap");
  const [message, setMessage] = useState<Message>(null);
  const [pending, startTransition] = useTransition();

  function flash(text: string, type: "ok" | "error" = "ok") {
    setMessage({ type, text });
  }

  function save<K extends TabId>(key: K, items: AdminData[K]) {
    const previous = data;
    setData({ ...data, [key]: items }); // hiện ngay, hoàn tác nếu server báo lỗi
    setMessage(null);
    startTransition(async () => {
      const result = await (SAVE[key] as (items: AdminData[K]) => Promise<SaveResult>)(items);
      flash(result.message, result.ok ? "ok" : "error");
      if (!result.ok) setData(previous);
    });
  }

  const current = TABS.find((t) => t.id === tab)!;

  return (
    <div className="mx-auto max-w-page px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Admin · local</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-fg">Quản lý nội dung</h1>
        </div>
        <Link href="/" className={buttonClass("secondary")}>
          Xem trang
        </Link>
      </div>

      <div className="mt-6 flex gap-3 border-2 border-fg bg-surface p-4 leading-relaxed text-fg-soft">
        <FolderGit2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <div>
          <p>
            Bấm <strong className="text-fg">Lưu</strong> = ghi thẳng vào file trong thư mục{" "}
            <code className="font-mono text-fg">content/</code> của project. Để đưa lên site:
          </p>
          <pre className="mt-2 overflow-x-auto bg-bg p-3 font-mono text-xs text-fg">
            git add content{"\n"}git commit -m &quot;Cập nhật nội dung&quot;{"\n"}git push
          </pre>
          <p className="mt-2 text-sm text-muted">Vercel sẽ tự build lại sau khoảng 1 phút. Trang này không tồn tại trên bản production.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Loại nội dung" className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
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
            className={`-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-3 font-mono text-sm transition-colors ${
              tab === t.id ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t.label}
            <span className="ml-2 bg-surface-2 px-2 py-0.5 text-xs text-muted">{data[t.id].length}</span>
          </button>
        ))}
      </div>

      <p className="pt-3 font-mono text-xs text-subtle">File: {current.file}</p>
      <p
        role="status"
        aria-live="polite"
        className={`min-h-6 py-3 text-sm font-medium whitespace-pre-line ${
          message?.type === "error" ? "text-red-600 dark:text-red-400" : "text-accent"
        }`}
      >
        {pending ? "Đang lưu…" : message?.text}
      </p>

      <div role="tabpanel" id="admin-panel" aria-labelledby={`tab-${tab}`}>
        {tab === "roadmap" && <RoadmapEditor items={data.roadmap} onChange={(items) => save("roadmap", items)} />}
        {tab === "credentials" && (
          <CredentialsEditor
            items={data.credentials}
            stages={data.roadmap}
            onChange={(items) => save("credentials", items)}
          />
        )}
        {tab === "projects" && (
          <ProjectsEditor items={data.projects} stages={data.roadmap} onChange={(items) => save("projects", items)} />
        )}
        {tab === "posts" && (
          <PostsEditor
            items={data.posts}
            stages={data.roadmap}
            onChange={(items) => save("posts", items)}
            onMessage={flash}
          />
        )}
      </div>
    </div>
  );
}
