"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { site } from "@/lib/site";

const nav = [
  { href: "/roadmap", label: "Lộ trình" },
  { href: "/certificates", label: "Chứng chỉ" },
  { href: "/projects", label: "Dự án" },
  { href: "/blog", label: "Blog" },
];

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {}
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
        <Link href="/" className="font-mono text-sm font-medium text-fg transition-colors hover:text-accent">
          <span className="text-accent">~/</span>
          {site.handle}
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(item.href) ? "text-accent" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Đổi giao diện sáng / tối"
            className="ml-1 grid size-10 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Sun className="hidden size-[18px] dark:block" aria-hidden />
            <Moon className="size-[18px] dark:hidden" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="grid size-10 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Điều hướng chính" className="border-t border-border bg-bg px-5 py-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex h-12 items-center border-b border-border text-[15px] last:border-b-0 ${
                isActive(item.href) ? "font-medium text-accent" : "text-fg-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
