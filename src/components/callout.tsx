import type { ReactNode } from "react";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";

const variants = {
  note: { icon: Info, label: "Ghi chú" },
  tip: { icon: Lightbulb, label: "Mẹo" },
  warn: { icon: TriangleAlert, label: "Lưu ý" },
};

// Dùng trong MDX: <Callout type="tip">Nội dung</Callout>
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, label } = variants[type];
  return (
    <aside className="not-prose my-6 flex gap-3 rounded-xl border border-border border-l-4 border-l-accent-strong bg-surface-2 p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
      <div className="text-[15px] leading-relaxed text-fg-soft">
        <p className="mb-1 font-semibold text-fg">{title ?? label}</p>
        {children}
      </div>
    </aside>
  );
}
