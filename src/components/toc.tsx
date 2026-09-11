"use client";

// Mục lục dính (sticky) bên phải bài viết; tô đậm mục đang đọc.
// Danh sách heading được tính phía server nên không gây layout shift.

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="Mục lục">
      <p className="font-mono text-xs uppercase tracking-widest text-subtle">Mục lục</p>
      <ol className="mt-3 space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1 font-mono text-xs leading-snug transition-colors ${
                heading.level === 3 ? "pl-6" : "pl-3"
              } ${
                active === heading.id
                  ? "border-accent text-fg"
                  : "border-transparent text-muted hover:border-subtle hover:text-fg"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
