import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/jsonld";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/search"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
