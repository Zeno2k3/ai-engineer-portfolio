import type { ReactNode } from "react";
import { eyebrowClass } from "@/lib/ui";

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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 border-fg pb-4">
      <div>
        <p className={eyebrowClass}>{label}</p>
        <h2 id={id} className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-12 border-b-2 border-fg pb-8">
      <p className={eyebrowClass}>{label}</p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-fg sm:text-6xl">{title}</h1>
      {description && <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-muted">{description}</p>}
      {children}
    </header>
  );
}
