import type { ReactNode } from "react";

export function SectionHeading({
  label,
  title,
  id,
  action,
}: {
  label: string;
  title: string;
  id?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{label}</p>
        <h2 id={id} className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ label, title, description }: { label: string; title: string; description?: string }) {
  return (
    <header className="mb-10">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">{label}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>}
    </header>
  );
}
