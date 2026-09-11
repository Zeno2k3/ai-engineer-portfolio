"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { MarkdownContent } from "@/components/markdown";
import {
  Button,
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
  buttonClass,
  inputClass,
} from "@/components/admin/ui";
import {
  CREDENTIAL_KINDS,
  CREDENTIAL_STATUSES,
  PROJECT_STATUSES,
  ROADMAP_STATUSES,
  ROADMAP_STATUS_LABELS,
  currentTopic,
  parseMonth,
  projectTimeline,
  stageProgress,
  type Credential,
  type Project,
  type RoadmapStage,
  type RoadmapStatus,
  type RoadmapTopic,
} from "@/lib/site";
import { newId, parseMarkdownNote, toTags, today, useCurrentMonth, type Note } from "@/lib/store";

const text = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

function stageOptions(stages: RoadmapStage[]) {
  return [
    { value: "", label: "— Không thuộc giai đoạn nào —" },
    ...stages.map((stage) => ({ value: stage.id, label: stage.title })),
  ];
}

const MONTH_PATTERN = "(0[1-9]|1[0-2])/\\d{4}";

function validateProjectDates(fd: FormData): string | null {
  const start = parseMonth(text(fd, "startDate"));
  const end = parseMonth(text(fd, "endDate"));
  if (end !== null && start === null) return "Có thời gian kết thúc thì cần nhập thời gian bắt đầu.";
  if (start !== null && end !== null && end < start) return "Thời gian kết thúc phải sau thời gian bắt đầu.";
  return null;
}

function FeaturedMark() {
  return (
    <>
      <span className="mr-1.5 text-accent" aria-hidden>
        ★
      </span>
      <span className="sr-only">Nổi bật: </span>
    </>
  );
}

// ---------- Khung chung: danh sách + form thêm/sửa ----------

function CollectionEditor<T>({
  items,
  onChange,
  itemLabel,
  getTitle,
  renderSummary,
  renderFields,
  fromForm,
  extraActions,
  reorderable = false,
  validate,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  itemLabel: string;
  getTitle: (item: T) => string;
  renderSummary: (item: T) => ReactNode;
  renderFields: (item: T | undefined) => ReactNode;
  fromForm: (fd: FormData, previous: T | undefined) => T;
  extraActions?: ReactNode;
  /** Cho phép đổi thứ tự (↑ ↓); mục mới được thêm vào cuối thay vì đầu. */
  reorderable?: boolean;
  /** Kiểm tra thêm trước khi lưu; trả về thông báo lỗi hoặc null. */
  validate?: (fd: FormData) => string | null;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [error, setError] = useState("");
  const current = typeof editing === "number" ? items[editing] : undefined;

  function openEditor(target: number | "new") {
    setEditing(target);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const problem = validate?.(fd);
    if (problem) return setError(problem);
    const item = fromForm(fd, current);
    if (editing === "new") onChange(reorderable ? [...items, item] : [item, ...items]);
    else onChange(items.map((it, i) => (i === editing ? item : it)));
    setEditing(null);
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setEditing(null);
  }

  function remove(index: number) {
    if (!window.confirm(`Xoá "${getTitle(items[index])}"?`)) return;
    onChange(items.filter((_, i) => i !== index));
    setEditing(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {items.length} {itemLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          <Button onClick={() => openEditor("new")}>
            <Plus className="size-4" aria-hidden /> Thêm {itemLabel}
          </Button>
        </div>
      </div>

      {editing !== null && (
        <form
          key={String(editing)}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-accent-strong/50 bg-surface p-5 sm:p-6"
        >
          <h3 className="font-semibold text-fg">
            {editing === "new" ? `Thêm ${itemLabel}` : `Sửa: ${current ? getTitle(current) : ""}`}
          </h3>
          {renderFields(current)}
          {error && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2 border-t border-border pt-5">
            <Button type="submit">Lưu</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Huỷ
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Chưa có {itemLabel} nào. Bấm “Thêm {itemLabel}” để bắt đầu.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {items.map((item, i) => (
            <li key={`${i}-${getTitle(item)}`} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">{renderSummary(item)}</div>
              <div className="flex gap-1">
                {reorderable && (
                  <>
                    <Button
                      variant="ghost"
                      className="px-2.5"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      aria-label={`Đưa lên: ${getTitle(item)}`}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2.5"
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                      aria-label={`Đưa xuống: ${getTitle(item)}`}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </Button>
                  </>
                )}
                <Button variant="ghost" onClick={() => openEditor(i)} aria-label={`Sửa ${getTitle(item)}`}>
                  <Pencil className="size-4" aria-hidden /> Sửa
                </Button>
                <Button variant="danger" onClick={() => remove(i)} aria-label={`Xoá ${getTitle(item)}`}>
                  <Trash2 className="size-4" aria-hidden /> Xoá
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- Lộ trình học ----------

// Checklist chủ đề: tick = đã học xong. Giá trị được gửi qua input ẩn dạng JSON.
function TopicsField({ defaultValue }: { defaultValue: RoadmapTopic[] }) {
  const [topics, setTopics] = useState<RoadmapTopic[]>(
    defaultValue.length > 0 ? defaultValue : [{ name: "", done: false }],
  );
  const [focusLast, setFocusLast] = useState(false);
  const filled = topics.filter((topic) => topic.name.trim());
  const doneCount = filled.filter((topic) => topic.done).length;

  function patch(index: number, change: Partial<RoadmapTopic>) {
    setTopics(topics.map((topic, i) => (i === index ? { ...topic, ...change } : topic)));
  }

  function add() {
    setTopics([...topics, { name: "", done: false }]);
    setFocusLast(true);
  }

  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-sm font-medium text-fg">Chủ đề trong giai đoạn</legend>
      <p className="text-xs text-subtle">
        Tick vào chủ đề đã học xong — tiến độ được tính từ đây ({doneCount}/{filled.length} xong). Chủ đề chưa tick
        đầu tiên sẽ hiện là “Đang học”.
      </p>
      <input
        type="hidden"
        name="topics"
        value={JSON.stringify(filled.map((topic) => ({ name: topic.name.trim(), done: topic.done })))}
      />
      <ul className="space-y-2">
        {topics.map((topic, i) => (
          <li key={i} className="flex items-center gap-2">
            <label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg border border-border bg-bg">
              <input
                type="checkbox"
                checked={topic.done}
                onChange={(e) => patch(i, { done: e.target.checked })}
                aria-label={`Đã xong chủ đề ${i + 1}`}
                className="size-4 cursor-pointer accent-accent-strong"
              />
            </label>
            <input
              value={topic.name}
              onChange={(e) => patch(i, { name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              aria-label={`Chủ đề ${i + 1}`}
              placeholder="Tên chủ đề, ví dụ: Embeddings"
              autoFocus={focusLast && i === topics.length - 1}
              className={`${inputClass} ${topic.done ? "text-muted line-through" : ""}`}
            />
            <Button
              variant="ghost"
              className="px-2.5"
              disabled={topics.length === 1}
              onClick={() => setTopics(topics.filter((_, j) => j !== i))}
              aria-label={`Xoá chủ đề ${i + 1}`}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="secondary" onClick={add}>
        <Plus className="size-4" aria-hidden /> Thêm chủ đề
      </Button>
    </fieldset>
  );
}

export function RoadmapEditor({
  items,
  onChange,
}: {
  items: RoadmapStage[];
  onChange: (items: RoadmapStage[]) => void;
}) {
  return (
    <CollectionEditor
      items={items}
      onChange={onChange}
      itemLabel="giai đoạn"
      reorderable
      getTitle={(s) => s.title}
      renderSummary={(s) => (
        <>
          <p className="font-medium text-fg">{s.title}</p>
          <p className="mt-0.5 text-sm text-muted">
            {ROADMAP_STATUS_LABELS[s.status]} · {stageProgress(s).done}/{s.topics.length} chủ đề (
            {stageProgress(s).percent}%)
            {currentTopic(s) && ` · đang học: ${currentTopic(s)}`}
          </p>
        </>
      )}
      renderFields={(s) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tên giai đoạn" name="title" required defaultValue={s?.title} placeholder="RAG & Vector Database" />
          <SelectField
            label="Trạng thái"
            name="status"
            options={ROADMAP_STATUSES.map((value) => ({ value, label: ROADMAP_STATUS_LABELS[value] }))}
            defaultValue={s?.status ?? "next"}
          />
          <TextAreaField
            label="Mô tả giai đoạn"
            name="description"
            rows={2}
            defaultValue={s?.description}
            placeholder="Giai đoạn này học để làm gì?"
            wrapperClassName="sm:col-span-2"
          />
          <TopicsField defaultValue={s?.topics ?? []} />
        </div>
      )}
      fromForm={(fd, previous) => ({
        id: previous?.id ?? newId(),
        title: text(fd, "title"),
        status: text(fd, "status") as RoadmapStatus,
        description: text(fd, "description") || undefined,
        topics: JSON.parse(text(fd, "topics") || "[]") as RoadmapTopic[],
      })}
    />
  );
}

// ---------- Chứng chỉ & khoá học ----------

export function CredentialsEditor({
  items,
  stages,
  onChange,
}: {
  items: Credential[];
  stages: RoadmapStage[];
  onChange: (items: Credential[]) => void;
}) {
  return (
    <CollectionEditor
      items={items}
      onChange={onChange}
      itemLabel="chứng chỉ / khoá học"
      getTitle={(c) => c.title}
      renderSummary={(c) => (
        <>
          <p className="font-medium text-fg">
            {c.featured && <FeaturedMark />}
            {c.title}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {[c.kind, c.issuer, c.date, c.status, stages.find((s) => s.id === c.stageId)?.title]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </>
      )}
      renderFields={(c) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tên chứng chỉ / khoá học" name="title" required defaultValue={c?.title} wrapperClassName="sm:col-span-2" />
          <TextField label="Nơi cấp / nền tảng" name="issuer" required defaultValue={c?.issuer} placeholder="Coursera · DeepLearning.AI" />
          <TextField
            label="Thời gian"
            name="date"
            defaultValue={c?.date}
            placeholder="09/2026"
            pattern="\d{2}/\d{4}"
            hint="Dạng MM/YYYY"
          />
          <SelectField label="Loại" name="kind" options={CREDENTIAL_KINDS} defaultValue={c?.kind} />
          <SelectField label="Trạng thái" name="status" options={CREDENTIAL_STATUSES} defaultValue={c?.status} />
          <TextField
            label="Link xác minh / trang khoá học"
            name="url"
            type="url"
            defaultValue={c?.url}
            placeholder="https://…"
            wrapperClassName="sm:col-span-2"
          />
          <TextAreaField label="Học được gì (1–2 câu)" name="note" rows={2} defaultValue={c?.note} wrapperClassName="sm:col-span-2" />
          <SelectField
            label="Thuộc giai đoạn lộ trình"
            name="stageId"
            options={stageOptions(stages)}
            defaultValue={c?.stageId ?? ""}
            hint="Khoá học/chứng chỉ sẽ hiện trong trang chi tiết của giai đoạn này"
            wrapperClassName="sm:col-span-2"
          />
          <CheckboxField
            label="Nổi bật"
            name="featured"
            defaultChecked={c?.featured}
            hint="Ưu tiên hiện trên trang chủ (trang chủ chỉ hiện tối đa 4 mục)"
            wrapperClassName="sm:col-span-2"
          />
        </div>
      )}
      fromForm={(fd) => ({
        stageId: text(fd, "stageId") || undefined,
        featured: fd.get("featured") === "on",
        title: text(fd, "title"),
        issuer: text(fd, "issuer"),
        kind: text(fd, "kind") as Credential["kind"],
        status: text(fd, "status") as Credential["status"],
        date: text(fd, "date"),
        url: text(fd, "url") || undefined,
        note: text(fd, "note") || undefined,
      })}
    />
  );
}

// ---------- Dự án ----------

export function ProjectsEditor({ items, onChange }: { items: Project[]; onChange: (items: Project[]) => void }) {
  const now = useCurrentMonth();

  return (
    <CollectionEditor
      items={items}
      onChange={onChange}
      itemLabel="dự án"
      getTitle={(p) => p.title}
      renderSummary={(p) => (
        <>
          <p className="font-medium text-fg">
            {p.featured && <FeaturedMark />}
            {p.title}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {[
              p.status,
              (() => {
                const timeline = projectTimeline(p, now);
                return timeline && [timeline.range, timeline.duration].filter(Boolean).join(" · ");
              })(),
              p.stack.join(", "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {!p.startDate && (
            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              Chưa nhập thời gian — bấm Sửa để thêm Bắt đầu / Kết thúc (trang web sẽ hiện thời gian dự án)
            </p>
          )}
        </>
      )}
      renderFields={(p) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tên dự án" name="title" required defaultValue={p?.title} />
          <SelectField label="Trạng thái" name="status" options={PROJECT_STATUSES} defaultValue={p?.status} />
          <TextField
            label="Bắt đầu"
            name="startDate"
            defaultValue={p?.startDate}
            placeholder="07/2026"
            pattern={MONTH_PATTERN}
            title="Dạng MM/YYYY, ví dụ 07/2026"
            hint="Dạng MM/YYYY"
          />
          <TextField
            label="Kết thúc"
            name="endDate"
            defaultValue={p?.endDate}
            placeholder="09/2026"
            pattern={MONTH_PATTERN}
            title="Dạng MM/YYYY, ví dụ 09/2026"
            hint="Để trống nếu dự án vẫn đang làm (hiện là “nay”)"
          />
          <TextAreaField label="Mô tả" name="description" required rows={3} defaultValue={p?.description} wrapperClassName="sm:col-span-2" />
          <TextField
            label="Công nghệ"
            name="stack"
            defaultValue={p?.stack.join(", ")}
            placeholder="Python, FastAPI, pgvector"
            hint="Cách nhau bằng dấu phẩy"
            wrapperClassName="sm:col-span-2"
          />
          <TextField label="Link source code" name="repo" type="url" defaultValue={p?.repo} placeholder="https://github.com/…" />
          <TextField label="Link demo" name="demo" type="url" defaultValue={p?.demo} placeholder="https://…" />
          <CheckboxField
            label="Nổi bật"
            name="featured"
            defaultChecked={p?.featured}
            hint="Ưu tiên hiện trên trang chủ (trang chủ chỉ hiện tối đa 3 dự án)"
            wrapperClassName="sm:col-span-2"
          />
        </div>
      )}
      validate={validateProjectDates}
      fromForm={(fd) => ({
        featured: fd.get("featured") === "on",
        startDate: text(fd, "startDate") || undefined,
        endDate: text(fd, "endDate") || undefined,
        title: text(fd, "title"),
        description: text(fd, "description"),
        status: text(fd, "status") as Project["status"],
        stack: toTags(text(fd, "stack")),
        repo: text(fd, "repo") || undefined,
        demo: text(fd, "demo") || undefined,
      })}
    />
  );
}

// ---------- Ghi chú ----------

function NoteContentField({ defaultValue }: { defaultValue: string }) {
  const [content, setContent] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="note-content" className="text-sm font-medium text-fg">
          Nội dung (Markdown)<span className="text-accent"> *</span>
        </label>
        <div className="flex rounded-lg border border-border p-0.5 text-sm" role="group" aria-label="Chế độ soạn">
          {[
            { value: false, label: "Viết" },
            { value: true, label: "Xem trước" },
          ].map((mode) => (
            <button
              key={mode.label}
              type="button"
              aria-pressed={preview === mode.value}
              onClick={() => setPreview(mode.value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 transition-colors ${
                preview === mode.value ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      {/* Luôn giữ textarea trong form để FormData có nội dung, chỉ ẩn khi xem trước */}
      <textarea
        id="note-content"
        name="content"
        required
        rows={14}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        hidden={preview}
        placeholder={"## Hôm nay mình học được\n\n- Ý 1\n- Ý 2\n\n```python\nprint('hello')\n```"}
        className={`${inputClass} font-mono text-sm leading-relaxed`}
      />
      {preview && (
        <div className="min-h-64 rounded-lg border border-border bg-bg p-5">
          {content.trim() ? (
            <MarkdownContent source={content} />
          ) : (
            <p className="text-sm text-subtle">Chưa có nội dung để xem trước.</p>
          )}
        </div>
      )}
      <p className="text-xs text-subtle">
        Hỗ trợ Markdown: # tiêu đề, **đậm**, danh sách, bảng, ```code```, [link](https://…).
      </p>
    </div>
  );
}

export function NotesEditor({
  items,
  stages,
  onChange,
  onMessage,
}: {
  items: Note[];
  stages: RoadmapStage[];
  onChange: (items: Note[]) => void;
  onMessage: (text: string, type?: "ok" | "error") => void;
}) {
  async function importMarkdown(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    try {
      const imported = await Promise.all(files.map(async (file) => parseMarkdownNote(await file.text(), file.name)));
      onChange([...imported, ...items]);
      onMessage(`Đã nhập ${imported.length} ghi chú từ file Markdown.`);
    } catch {
      onMessage("Không đọc được file. Hãy chọn file .md dạng văn bản.", "error");
    }
  }

  return (
    <CollectionEditor
      items={items}
      onChange={onChange}
      itemLabel="ghi chú"
      getTitle={(n) => n.title}
      extraActions={
        <label className={buttonClass("secondary")}>
          <Upload className="size-4" aria-hidden /> Nhập file .md
          <input type="file" accept=".md,.mdx,.markdown,text/markdown" multiple className="sr-only" onChange={importMarkdown} />
        </label>
      }
      renderSummary={(n) => (
        <>
          <Link
            href={`/note?id=${encodeURIComponent(n.id)}`}
            className="font-medium text-fg underline-offset-4 hover:text-accent hover:underline"
          >
            {n.title}
          </Link>
          <p className="mt-0.5 font-mono text-xs text-subtle">
            {n.date}
            {n.tags.length > 0 && ` · ${n.tags.map((t) => `#${t}`).join(" ")}`}
          </p>
        </>
      )}
      renderFields={(n) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tiêu đề" name="title" required defaultValue={n?.title} wrapperClassName="sm:col-span-2" />
          <TextAreaField
            label="Mô tả ngắn"
            name="description"
            rows={2}
            defaultValue={n?.description}
            hint="Hiện ở danh sách bài viết"
            wrapperClassName="sm:col-span-2"
          />
          <TextField label="Ngày" name="date" type="date" required defaultValue={n?.date ?? today()} />
          <TextField
            label="Tags"
            name="tags"
            defaultValue={n?.tags.join(", ")}
            placeholder="rag, llm"
            hint="Cách nhau bằng dấu phẩy"
          />
          <SelectField
            label="Thuộc giai đoạn lộ trình"
            name="stageId"
            options={stageOptions(stages)}
            defaultValue={n?.stageId ?? ""}
            hint="Ghi chú sẽ hiện trong trang chi tiết của giai đoạn này"
            wrapperClassName="sm:col-span-2"
          />
          <NoteContentField defaultValue={n?.content ?? ""} />
        </div>
      )}
      fromForm={(fd, previous) => ({
        id: previous?.id ?? newId(),
        title: text(fd, "title"),
        description: text(fd, "description"),
        date: text(fd, "date") || today(),
        tags: toTags(text(fd, "tags")),
        content: text(fd, "content"),
        stageId: text(fd, "stageId") || undefined,
      })}
    />
  );
}
