"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, LoaderCircle, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { MarkdownContent } from "@/components/markdown";
import { useCurrentMonth } from "@/components/project-timeline";
import {
  Button,
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
  buttonClass,
  inputClass,
} from "@/components/admin/ui";
import type { EditablePost } from "@/lib/posts";
import {
  CREDENTIAL_KINDS,
  CREDENTIAL_STATUSES,
  PROJECT_DOMAINS,
  PROJECT_STATUSES,
  ROADMAP_STATUSES,
  ROADMAP_STATUS_LABELS,
  currentTopic,
  parseMonth,
  projectTimeline,
  stageProgress,
  type Credential,
  type Profile,
  type Project,
  type ProjectMetric,
  type RoadmapStage,
  type RoadmapStatus,
  type RoadmapTopic,
  type TimelineItem,
} from "@/lib/site";
import { slugify, toTags, today, uniqueSlug } from "@/lib/utils";

const text = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();
const optional = (fd: FormData, name: string) => text(fd, name) || undefined;

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

/** Slug nhập tay (đã chuẩn hoá) → slug cũ khi sửa → tạo từ tiêu đề, không trùng với mục khác. */
function resolveSlug(fd: FormData, previous: { slug: string } | undefined, taken: string[]): string {
  const typed = slugify(text(fd, "slug"));
  if (typed) return typed;
  if (previous) return previous.slug;
  return uniqueSlug(slugify(text(fd, "title")), taken);
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
        <form key={String(editing)} onSubmit={handleSubmit} className="space-y-5 border-2 border-fg bg-surface p-5 sm:p-6">
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
        <p className="border border-dashed border-border p-8 text-center text-sm text-muted">
          Chưa có {itemLabel} nào. Bấm “Thêm {itemLabel}” để bắt đầu.
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-surface">
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

// ---------- Hồ sơ cá nhân (content/profile.json) ----------

/** Tiêu đề nhóm trường trong form hồ sơ. */
function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <div>
        <h4 className="font-mono text-xs uppercase tracking-widest text-accent">{title}</h4>
        {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

// Các đoạn văn giới thiệu ở /about. Giá trị gửi qua input ẩn dạng JSON (giống TopicsField).
function BioField({ defaultValue, onEdit }: { defaultValue: string[]; onEdit: () => void }) {
  const [paragraphs, setParagraphs] = useState<string[]>(defaultValue.length > 0 ? defaultValue : [""]);
  const filled = paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-sm font-medium text-fg">Đoạn giới thiệu</legend>
      <p className="text-xs text-subtle">
        Mỗi ô là một đoạn văn ở đầu trang /about ({filled.length} đoạn sẽ được lưu). Ô để trống bị bỏ qua.
      </p>
      <input type="hidden" name="bio" value={JSON.stringify(filled)} />
      <ul className="space-y-2">
        {paragraphs.map((paragraph, i) => (
          <li key={i} className="flex items-start gap-2">
            <textarea
              value={paragraph}
              onChange={(e) => setParagraphs(paragraphs.map((p, j) => (j === i ? e.target.value : p)))}
              rows={3}
              aria-label={`Đoạn giới thiệu ${i + 1}`}
              placeholder="Mình đang tự học để trở thành AI Engineer — tập trung vào…"
              className={`${inputClass} leading-relaxed`}
            />
            <Button
              variant="ghost"
              className="px-2.5"
              disabled={paragraphs.length === 1}
              onClick={() => {
                setParagraphs(paragraphs.filter((_, j) => j !== i));
                onEdit();
              }}
              aria-label={`Xoá đoạn giới thiệu ${i + 1}`}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        onClick={() => {
          setParagraphs([...paragraphs, ""]);
          onEdit();
        }}
      >
        <Plus className="size-4" aria-hidden /> Thêm đoạn
      </Button>
    </fieldset>
  );
}

const EMPTY_TIMELINE_ITEM: TimelineItem = { period: "", title: "", impact: "" };

// Mốc "Hành trình" ở /about: cần đủ 3 ô thì mục mới được lưu.
function TimelineField({ defaultValue, onEdit }: { defaultValue: TimelineItem[]; onEdit: () => void }) {
  const [items, setItems] = useState<TimelineItem[]>(
    defaultValue.length > 0 ? defaultValue : [EMPTY_TIMELINE_ITEM],
  );
  const filled = items
    .map((item) => ({ period: item.period.trim(), title: item.title.trim(), impact: item.impact.trim() }))
    .filter((item) => item.period && item.title && item.impact);

  function patch(index: number, change: Partial<TimelineItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...change } : item)));
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    onEdit();
  }

  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-sm font-medium text-fg">Hành trình (timeline)</legend>
      <p className="text-xs text-subtle">
        Các mốc hiện ở mục “Hành trình” trang /about, theo đúng thứ tự dưới đây ({filled.length} mốc sẽ được lưu).
        Mốc thiếu ô sẽ bị bỏ qua.
      </p>
      <input type="hidden" name="timeline" value={JSON.stringify(filled)} />
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="space-y-2 border border-border bg-bg p-3">
            <div className="flex items-center gap-2">
              <input
                value={item.period}
                onChange={(e) => patch(i, { period: e.target.value })}
                aria-label={`Mốc ${i + 1}: thời gian`}
                placeholder="2026 — nay"
                className={`${inputClass} font-mono sm:max-w-48`}
              />
              <div className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  className="px-2.5"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label={`Đưa mốc ${i + 1} lên`}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  className="px-2.5"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={`Đưa mốc ${i + 1} xuống`}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  className="px-2.5"
                  disabled={items.length === 1}
                  onClick={() => {
                    setItems(items.filter((_, j) => j !== i));
                    onEdit();
                  }}
                  aria-label={`Xoá mốc ${i + 1}`}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
            <input
              value={item.title}
              onChange={(e) => patch(i, { title: e.target.value })}
              aria-label={`Mốc ${i + 1}: tiêu đề`}
              placeholder="Tự học AI Engineering"
              className={inputClass}
            />
            <textarea
              value={item.impact}
              onChange={(e) => patch(i, { impact: e.target.value })}
              rows={2}
              aria-label={`Mốc ${i + 1}: kết quả`}
              placeholder="Làm được gì, kết quả đo được ra sao?"
              className={`${inputClass} leading-relaxed`}
            />
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        onClick={() => {
          setItems([...items, EMPTY_TIMELINE_ITEM]);
          onEdit();
        }}
      >
        <Plus className="size-4" aria-hidden /> Thêm mốc
      </Button>
    </fieldset>
  );
}

export function ProfileEditor({
  profile,
  pending,
  onChange,
}: {
  profile: Profile;
  /** Đang ghi file — khoá nút Lưu để tránh bấm hai lần. */
  pending: boolean;
  onChange: (profile: Profile) => void;
}) {
  // Cờ "chưa lưu" tự về false sau mỗi lần lưu thành công: AdminApp đổi `key` → form mount lại.
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    onChange({
      name: text(fd, "name"),
      handle: slugify(text(fd, "handle")) || profile.handle,
      role: text(fd, "role"),
      headline: text(fd, "headline"),
      title: text(fd, "title"),
      description: text(fd, "description"),
      email: text(fd, "email"),
      cvUrl: text(fd, "cvUrl"),
      availability: { open: fd.get("availabilityOpen") === "on", label: text(fd, "availabilityLabel") },
      socials: { github: text(fd, "github"), linkedin: text(fd, "linkedin") },
      about: {
        bio: JSON.parse(text(fd, "bio") || "[]") as string[],
        timeline: JSON.parse(text(fd, "timeline") || "[]") as TimelineItem[],
      },
    });
  }

  return (
    // onInput bắt mọi lần gõ; các nút thêm/xoá/đổi thứ tự tự gọi markDirty.
    <form onSubmit={handleSubmit} onInput={markDirty} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Thông tin cá nhân hiện ở trang Giới thiệu, Liên hệ, trang chủ và header/footer.</p>
        <Link href="/about" className={buttonClass("secondary")}>
          Xem trang Giới thiệu
        </Link>
      </div>

      <div className="space-y-6 border-2 border-fg bg-surface p-5 sm:p-6">
        <FormSection title="Bạn là ai">
          <TextField label="Tên hiển thị" name="name" required defaultValue={profile.name} placeholder="Minh Quân" />
          <TextField
            label="Handle"
            name="handle"
            required
            defaultValue={profile.handle}
            placeholder="minhquan"
            hint="Hiện dạng @handle ở header. Chỉ chữ thường không dấu, số và dấu gạch ngang."
          />
          <TextField
            label="Chức danh"
            name="role"
            required
            defaultValue={profile.role}
            placeholder="AI Engineer (đang trên hành trình)"
            wrapperClassName="sm:col-span-2"
          />
          <TextAreaField
            label="Câu mở đầu (headline)"
            name="headline"
            required
            rows={2}
            defaultValue={profile.headline}
            placeholder="Học và xây hệ thống LLM: RAG, Agents, Evals."
            hint="Hiện ở trang chủ và trên ảnh Open Graph khi chia sẻ link."
            wrapperClassName="sm:col-span-2"
          />
        </FormSection>

        <FormSection title="Trang giới thiệu" hint="Nội dung riêng của trang /about.">
          <BioField defaultValue={profile.about.bio} onEdit={markDirty} />
          <TimelineField defaultValue={profile.about.timeline} onEdit={markDirty} />
        </FormSection>

        <FormSection title="Liên hệ & trạng thái">
          <CheckboxField
            label="Đang mở cơ hội (Open to work)"
            name="availabilityOpen"
            defaultChecked={profile.availability.open}
            hint="Hiện chấm xanh “Open to work” ở trang Giới thiệu và Liên hệ"
            wrapperClassName="sm:col-span-2"
          />
          <TextField
            label="Mô tả trạng thái"
            name="availabilityLabel"
            required
            defaultValue={profile.availability.label}
            placeholder="Sẵn sàng trao đổi về dự án và cơ hội làm việc"
            wrapperClassName="sm:col-span-2"
          />
          <TextField
            label="Email"
            name="email"
            defaultValue={profile.email}
            placeholder="ten@example.com"
            hint="Chỉ hiện (dạng che) khi form liên hệ gặp lỗi. Để trống nếu chưa muốn công khai."
          />
          <TextField
            label="Link CV"
            name="cvUrl"
            defaultValue={profile.cvUrl}
            placeholder="/cv.pdf"
            hint="Đặt file vào thư mục public/ rồi điền /ten-file.pdf. Để trống thì ẩn nút tải CV."
          />
          <TextField
            label="GitHub"
            name="github"
            type="url"
            defaultValue={profile.socials.github}
            placeholder="https://github.com/ten-cua-ban"
          />
          <TextField
            label="LinkedIn"
            name="linkedin"
            type="url"
            defaultValue={profile.socials.linkedin}
            placeholder="https://www.linkedin.com/in/ten-cua-ban"
          />
        </FormSection>

        <FormSection title="SEO" hint="Dùng cho thẻ <title>, mô tả trên Google, RSS và llms.txt.">
          <TextField
            label="Tiêu đề site"
            name="title"
            required
            defaultValue={profile.title}
            placeholder="Minh Quân — Hành trình AI Engineer"
            wrapperClassName="sm:col-span-2"
          />
          <TextAreaField
            label="Mô tả site"
            name="description"
            required
            rows={3}
            defaultValue={profile.description}
            placeholder="Portfolio và blog ghi lại những gì mình học được…"
            hint="Khoảng 150–160 ký tự là vừa đẹp trên kết quả tìm kiếm."
            wrapperClassName="sm:col-span-2"
          />
        </FormSection>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden /> Đang lưu…
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden /> Lưu hồ sơ
              </>
            )}
          </Button>
          {dirty && !pending && (
            <p className="font-mono text-xs text-muted">
              <span className="text-accent" aria-hidden>
                ●
              </span>{" "}
              Có thay đổi chưa lưu
            </p>
          )}
        </div>
      </div>
    </form>
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
            <label className="grid size-11 shrink-0 cursor-pointer place-items-center border border-border-strong bg-bg">
              <input
                type="checkbox"
                checked={topic.done}
                onChange={(e) => patch(i, { done: e.target.checked })}
                aria-label={`Đã xong chủ đề ${i + 1}`}
                className="size-4 cursor-pointer accent-accent"
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
          <p className="mt-0.5 font-mono text-xs text-subtle">/roadmap/{s.id}</p>
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
        // id giữ nguyên khi sửa để link /roadmap/<id> và các mục đã gắn không bị gãy.
        id: previous?.id ?? uniqueSlug(slugify(text(fd, "title")), items.map((s) => s.id)),
        title: text(fd, "title"),
        status: text(fd, "status") as RoadmapStatus,
        description: optional(fd, "description"),
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
            pattern={MONTH_PATTERN}
            title="Dạng MM/YYYY, ví dụ 09/2026"
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
            hint="Ưu tiên hiện ở trang Giới thiệu"
            wrapperClassName="sm:col-span-2"
          />
        </div>
      )}
      fromForm={(fd) => ({
        title: text(fd, "title"),
        issuer: text(fd, "issuer"),
        kind: text(fd, "kind") as Credential["kind"],
        status: text(fd, "status") as Credential["status"],
        date: optional(fd, "date"),
        url: optional(fd, "url"),
        note: optional(fd, "note"),
        stageId: optional(fd, "stageId"),
        featured: fd.get("featured") === "on",
      })}
    />
  );
}

// ---------- Nội dung MDX (dùng chung cho dự án và bài viết) ----------

function MdxBodyField({ name, label, defaultValue, rows = 16 }: { name: string; label: string; defaultValue: string; rows?: number }) {
  const [content, setContent] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${name}-field`} className="text-sm font-medium text-fg">
          {label}
        </label>
        <div className="flex border border-border p-0.5 text-sm" role="group" aria-label="Chế độ soạn">
          {[
            { value: false, label: "Viết" },
            { value: true, label: "Xem trước" },
          ].map((mode) => (
            <button
              key={mode.label}
              type="button"
              aria-pressed={preview === mode.value}
              onClick={() => setPreview(mode.value)}
              className={`cursor-pointer px-3 py-1.5 transition-colors ${
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
        id={`${name}-field`}
        name={name}
        rows={rows}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        hidden={preview}
        placeholder={"## Vấn đề\n\n…\n\n```python title=\"main.py\"\nprint('hello')\n```"}
        className={`${inputClass} font-mono text-sm leading-relaxed`}
      />
      {preview && (
        <div className="min-h-64 border border-border bg-bg p-5">
          {content.trim() ? (
            <MarkdownContent source={content} />
          ) : (
            <p className="text-sm text-subtle">Chưa có nội dung để xem trước.</p>
          )}
        </div>
      )}
      <p className="text-xs text-subtle">
        Markdown/MDX: ## tiêu đề, **đậm**, bảng, ```code```, &lt;Callout type=&quot;tip&quot;&gt;…&lt;/Callout&gt;. Xem trước chỉ
        hiển thị Markdown cơ bản — component MDX và tô màu code chỉ thấy trên trang thật.
      </p>
    </div>
  );
}

// ---------- Dự án (content/work/<slug>.mdx) ----------

// Mỗi dòng: "Nhãn | Giá trị | Thay đổi (không bắt buộc)", ví dụ "Hit rate | 0.82 | +12%".
function metricsToText(metrics: ProjectMetric[]): string {
  return metrics.map((m) => [m.label, m.value, m.delta].filter(Boolean).join(" | ")).join("\n");
}

function textToMetrics(value: string): ProjectMetric[] {
  return value
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, value]) => label && value)
    .map(([label, value, delta]) => ({ label, value, delta: delta || undefined }));
}

export function ProjectsEditor({
  items,
  stages,
  onChange,
}: {
  items: Project[];
  stages: RoadmapStage[];
  onChange: (items: Project[]) => void;
}) {
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
              p.domain,
              p.status,
              (() => {
                const timeline = projectTimeline(p, now);
                return timeline && [timeline.range, timeline.duration].filter(Boolean).join(" · ");
              })(),
              p.nda && "NDA",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-0.5 font-mono text-xs text-subtle">
            {p.status === "Ý tưởng" ? "Ẩn khỏi /work (chỉ hiện ở /now)" : `/work/${p.slug}`}
          </p>
        </>
      )}
      renderFields={(p) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tên dự án" name="title" required defaultValue={p?.title} />
          <TextField
            label="Slug (URL)"
            name="slug"
            defaultValue={p?.slug}
            placeholder="tu-tao-tu-ten-du-an"
            hint="Để trống = tạo từ tên. Đổi slug sẽ đổi URL /work/<slug>."
          />
          <TextAreaField label="Tagline (1 câu)" name="tagline" required rows={2} defaultValue={p?.tagline} wrapperClassName="sm:col-span-2" />
          <SelectField label="Lĩnh vực" name="domain" options={PROJECT_DOMAINS} defaultValue={p?.domain} />
          <SelectField
            label="Trạng thái"
            name="status"
            options={PROJECT_STATUSES}
            defaultValue={p?.status}
            hint="“Ý tưởng” không hiện ở /work — chỉ ở /now"
          />
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
          <TextField
            label="Công nghệ"
            name="stack"
            defaultValue={p?.stack.join(", ")}
            placeholder="Python, FastAPI, pgvector"
            hint="Cách nhau bằng dấu phẩy"
            wrapperClassName="sm:col-span-2"
          />
          <TextAreaField
            label="Số liệu (metric)"
            name="metrics"
            rows={3}
            defaultValue={p ? metricsToText(p.metrics) : ""}
            placeholder={"Hit rate | 0.82\np95 latency | 420ms | −35%"}
            hint="Mỗi dòng: Nhãn | Giá trị | Thay đổi. Chỉ ghi số liệu thật, đo được."
            wrapperClassName="sm:col-span-2"
          />
          <TextField label="Link source code" name="repo" type="url" defaultValue={p?.repo} placeholder="https://github.com/…" />
          <TextField label="Link demo" name="demo" type="url" defaultValue={p?.demo} placeholder="https://…" />
          <TextField label="Link paper / writeup" name="paper" type="url" defaultValue={p?.paper} placeholder="https://…" />
          <SelectField
            label="Thuộc giai đoạn lộ trình"
            name="stage"
            options={stageOptions(stages)}
            defaultValue={p?.stage ?? ""}
          />
          <CheckboxField
            label="Nổi bật"
            name="featured"
            defaultChecked={p?.featured}
            hint="Ưu tiên hiện trên trang chủ (tối đa 3 dự án)"
          />
          <CheckboxField
            label="Confidential / NDA"
            name="nda"
            defaultChecked={p?.nda}
            hint="Ẩn link repo, hiện badge NDA — chỉ mô tả vấn đề và cách tiếp cận ở mức trừu tượng"
          />
          <MdxBodyField
            name="body"
            label="Case study (MDX): Vấn đề → Dữ liệu → Cách tiếp cận → Kiến trúc → Đánh giá → Kết quả → Bài học"
            defaultValue={p?.body ?? ""}
          />
        </div>
      )}
      validate={validateProjectDates}
      fromForm={(fd, previous) => ({
        slug: resolveSlug(fd, previous, items.map((p) => p.slug)),
        title: text(fd, "title"),
        tagline: text(fd, "tagline"),
        domain: text(fd, "domain") as Project["domain"],
        status: text(fd, "status") as Project["status"],
        stack: toTags(text(fd, "stack")),
        startDate: optional(fd, "startDate"),
        endDate: optional(fd, "endDate"),
        repo: optional(fd, "repo"),
        demo: optional(fd, "demo"),
        paper: optional(fd, "paper"),
        nda: fd.get("nda") === "on",
        featured: fd.get("featured") === "on",
        stage: optional(fd, "stage"),
        metrics: textToMetrics(text(fd, "metrics")),
        body: text(fd, "body"),
      })}
    />
  );
}

// ---------- Bài viết (content/blog/<slug>.mdx) ----------

/** Đọc file .md/.mdx (có thể có frontmatter title/description/date/tags) thành bài viết. */
function parseMarkdownFile(text: string, fileName: string, taken: string[]): EditablePost {
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
  const title = meta.title || heading || fileName.replace(/\.(md|mdx|markdown)$/i, "");

  return {
    slug: uniqueSlug(slugify(title), taken),
    title,
    description: meta.description ?? "",
    date: /^\d{4}-\d{2}-\d{2}/.exec(meta.date ?? "")?.[0] ?? today(),
    tags: toTags((meta.tags ?? "").replace(/^\[|\]$/g, "").split(",").map((tag) => tag.trim().replace(/^["']|["']$/g, ""))),
    draft: true,
    math: false,
    content: body.trim(),
  };
}

export function PostsEditor({
  items,
  stages,
  onChange,
  onMessage,
}: {
  items: EditablePost[];
  stages: RoadmapStage[];
  onChange: (items: EditablePost[]) => void;
  onMessage: (text: string, type?: "ok" | "error") => void;
}) {
  async function importMarkdown(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (files.length === 0) return;
    try {
      const taken = items.map((p) => p.slug);
      const imported: EditablePost[] = [];
      for (const file of files) {
        const post = parseMarkdownFile(await file.text(), file.name, taken);
        taken.push(post.slug);
        imported.push(post);
      }
      onChange([...imported, ...items]);
      onMessage(`Đã nhập ${imported.length} bài (đang để chế độ nháp).`);
    } catch {
      onMessage("Không đọc được file. Hãy chọn file .md dạng văn bản.", "error");
    }
  }

  return (
    <CollectionEditor
      items={items}
      onChange={onChange}
      itemLabel="bài viết"
      getTitle={(n) => n.title}
      extraActions={
        <label className={buttonClass("secondary")}>
          <Upload className="size-4" aria-hidden /> Nhập file .md
          <input type="file" accept=".md,.mdx,.markdown,text/markdown" multiple className="sr-only" onChange={importMarkdown} />
        </label>
      }
      renderSummary={(n) => (
        <>
          <Link href={`/blog/${n.slug}`} className="font-medium text-fg underline-offset-4 hover:text-accent hover:underline">
            {n.title}
          </Link>
          {n.draft && <span className="ml-2 font-mono text-xs text-accent-2">[nháp]</span>}
          <p className="mt-0.5 font-mono text-xs text-subtle">
            {n.date}
            {n.tags.length > 0 && ` · ${n.tags.map((t) => `#${t}`).join(" ")}`}
            {n.series && ` · series: ${n.series}${n.seriesPart ? ` (${n.seriesPart})` : ""}`}
          </p>
        </>
      )}
      renderFields={(n) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Tiêu đề" name="title" required maxLength={110} defaultValue={n?.title} hint="Tối đa 110 ký tự" />
          <TextField
            label="Slug (URL)"
            name="slug"
            defaultValue={n?.slug}
            placeholder="tu-tao-tu-tieu-de"
            hint="Để trống = tạo từ tiêu đề. Đổi slug sẽ đổi URL /blog/<slug>."
          />
          <TextAreaField
            label="Mô tả ngắn"
            name="description"
            rows={2}
            maxLength={200}
            defaultValue={n?.description}
            hint="Hiện ở danh sách bài viết, RSS và khi chia sẻ (tối đa 200 ký tự)"
            wrapperClassName="sm:col-span-2"
          />
          <TextField label="Ngày đăng" name="date" type="date" required defaultValue={n?.date ?? today()} />
          <TextField label="Ngày cập nhật" name="updated" type="date" defaultValue={n?.updated} hint="Để trống nếu chưa sửa lại" />
          <TextField label="Tags" name="tags" defaultValue={n?.tags.join(", ")} placeholder="rag, llm" hint="Cách nhau bằng dấu phẩy" />
          <SelectField label="Thuộc giai đoạn lộ trình" name="stage" options={stageOptions(stages)} defaultValue={n?.stage ?? ""} />
          <TextField label="Series" name="series" defaultValue={n?.series} placeholder="RAG từ con số 0" hint="Để trống nếu là bài lẻ" />
          <TextField label="Phần số" name="seriesPart" type="number" min={1} defaultValue={n?.seriesPart} />
          <CheckboxField label="Bản nháp" name="draft" defaultChecked={n?.draft} hint="Chỉ hiện khi chạy local, không lên site" />
          <CheckboxField label="Có công thức toán" name="math" defaultChecked={n?.math} hint="Bật KaTeX cho cú pháp $…$ và $$…$$" />
          <MdxBodyField name="content" label="Nội dung (MDX)" defaultValue={n?.content ?? ""} />
        </div>
      )}
      fromForm={(fd, previous) => ({
        slug: resolveSlug(fd, previous, items.map((p) => p.slug)),
        title: text(fd, "title"),
        description: text(fd, "description"),
        date: text(fd, "date") || today(),
        updated: optional(fd, "updated"),
        tags: toTags(text(fd, "tags")),
        stage: optional(fd, "stage"),
        series: optional(fd, "series"),
        seriesPart: text(fd, "seriesPart") ? Number(text(fd, "seriesPart")) : undefined,
        draft: fd.get("draft") === "on",
        math: fd.get("math") === "on",
        content: text(fd, "content"),
      })}
    />
  );
}
