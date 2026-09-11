"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

const nav = [
  { href: "/work", label: "Dự án" },
  { href: "/blog", label: "Blog", also: ["/tags", "/series"] },
  { href: "/roadmap", label: "Lộ trình", also: ["/certificates"] },
  { href: "/about", label: "Giới thiệu" },
  { href: "/now", label: "Now" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (item: (typeof nav)[number]) =>
    [item.href, ...(item.also ?? [])].some((href) => pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-5">
        <Link href="/" className="font-mono text-sm font-medium text-fg transition-colors hover:text-accent">
          <span className="text-accent">~/</span>
          {site.handle}
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center md:flex" aria-label="Điều hướng chính">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item) ? "page" : undefined}
                className={`px-3 py-2 font-mono text-sm transition-colors ${
                  isActive(item) ? "text-fg underline decoration-accent decoration-2 underline-offset-8" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <CommandPalette />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="grid size-10 cursor-pointer place-items-center text-muted transition-colors hover:bg-surface-2 hover:text-fg md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Điều hướng chính" className="border-t border-border bg-bg px-5 py-2 md:hidden">
          {[...nav, { href: "/contact", label: "Liên hệ" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item) ? "page" : undefined}
              className={`flex h-12 items-center border-b border-border font-mono text-[15px] last:border-b-0 ${
                isActive(item) ? "text-accent" : "text-fg-soft"
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
