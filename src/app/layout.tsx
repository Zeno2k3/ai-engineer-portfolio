import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

// Font đều có subset tiếng Việt (spec ghi "subset Latin" — với site tiếng Việt sẽ vỡ dấu).
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
  axes: ["opsz"],
  preload: false,
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  alternates: {
    types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} — RSS` }] },
  },
  openGraph: {
    type: "website",
    siteName: site.title,
    locale: "vi_VN",
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

// Chạy trước khi paint để không nháy sai theme. Mặc định: theo hệ điều hành.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${newsreader.variable} ${fraunces.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-50 bg-accent-strong px-4 py-3 font-mono text-sm text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Bỏ qua điều hướng
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
