import { renderOg } from "@/lib/og";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({ eyebrow: "AI ENGINEER", title: site.name, subtitle: site.headline });
}
