// Dữ liệu có cấu trúc (schema.org) — render phía server để Google đọc được (spec §11).

import { site, socialLinks } from "@/lib/site";

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

export function personLd() {
  return {
    "@type": "Person",
    "@id": absoluteUrl("/about#person"),
    name: site.name,
    url: absoluteUrl("/about"),
    jobTitle: "AI Engineer",
    sameAs: socialLinks().map((link) => link.href),
  };
}

/** items: [{ name, path }] theo thứ tự từ trang chủ tới trang hiện tại. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      // ListItem cuối (trang hiện tại) có thể bỏ `item`.
      ...(i < items.length - 1 && { item: absoluteUrl(item.path) }),
    })),
  };
}
