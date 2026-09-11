import Link from "next/link";
import { site, socialLinks } from "@/lib/site";
import { containerClass } from "@/lib/ui";

const columns = [
  {
    title: "Nội dung",
    links: [
      { label: "Dự án", href: "/work" },
      { label: "Blog", href: "/blog" },
      { label: "Lộ trình học", href: "/roadmap" },
      { label: "Chứng chỉ", href: "/certificates" },
    ],
  },
  {
    title: "Về mình",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Now", href: "/now" },
      { label: "Liên hệ", href: "/contact" },
      { label: "Tìm kiếm", href: "/search" },
    ],
  },
];

const linkClass = "font-mono text-sm text-muted transition-colors hover:text-fg";

export function SiteFooter() {
  const isDev = process.env.NODE_ENV === "development";
  const follow = [{ label: "RSS", href: "/rss.xml" }, ...socialLinks()];

  return (
    <footer className="border-t-2 border-fg bg-surface">
      <div className={`${containerClass} grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4`}>
        <div>
          <p className="font-mono text-sm text-fg">
            <span className="text-accent">~/</span>
            {site.handle}
          </p>
          <p className="mt-3 max-w-xs leading-relaxed text-muted">{site.description}</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="font-mono text-xs uppercase tracking-widest text-subtle">{column.title}</h2>
            <ul className="mt-4 space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`${linkClass} inline-block py-1`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-subtle">Theo dõi</h2>
          <ul className="mt-4 space-y-1">
            {follow.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  {...(link.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                  className={`${linkClass} inline-block py-1`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className={`${containerClass} flex flex-wrap items-center justify-between gap-2 py-5 font-mono text-xs text-subtle`}>
          <span>
            © {new Date().getFullYear()} {site.name} · Học mỗi ngày một chút.
          </span>
          <span>
            Built with Next.js · MDX · Shiki · KaTeX
            {isDev && (
              <>
                {" · "}
                <Link href="/admin" className="text-accent hover:underline">
                  Admin (local)
                </Link>
              </>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
