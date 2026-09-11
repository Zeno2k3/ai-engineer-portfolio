import type { ReactNode } from "react";
import { CircleAlert, Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";

const variants = {
  note: { icon: Info, label: "Ghi chú", border: "border-l-fg" },
  info: { icon: Info, label: "Thông tin", border: "border-l-fg" },
  tip: { icon: Lightbulb, label: "Mẹo", border: "border-l-accent" },
  warn: { icon: TriangleAlert, label: "Lưu ý", border: "border-l-accent-2" },
  danger: { icon: OctagonAlert, label: "Cẩn thận", border: "border-l-accent-2" },
};

// Dùng trong MDX: <Callout type="tip">Nội dung</Callout> — type: note | info | tip | warn | danger
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: ReactNode;
}) {
  const variant = variants[type] ?? { icon: CircleAlert, label: "Ghi chú", border: "border-l-fg" };
  const { icon: Icon, label } = variant;
  return (
    <aside className={`not-prose my-6 flex gap-3 border border-border border-l-4 bg-surface-2 p-4 ${variant.border}`}>
      <Icon className="mt-1 size-5 shrink-0 text-fg" aria-hidden />
      <div className="leading-relaxed text-fg-soft [&_p]:m-0">
        <p className="mb-1 font-mono text-sm font-semibold uppercase tracking-wide text-fg">{title ?? label}</p>
        {children}
      </div>
    </aside>
  );
}
