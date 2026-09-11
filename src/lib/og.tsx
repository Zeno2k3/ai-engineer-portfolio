// Ảnh Open Graph 1200×630 tạo lúc build bằng next/og. Font Be Vietnam Pro (TTF) để hiện đúng dấu tiếng Việt.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Đọc font một lần ở cấp module (cache theo instance).
const bold = readFile(join(process.cwd(), "assets/fonts/BeVietnamPro-Bold.ttf"));
const regular = readFile(join(process.cwd(), "assets/fonts/BeVietnamPro-Regular.ttf"));

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

export async function renderOg({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          color: "#F5F5F0",
          padding: "64px 72px",
          borderLeft: "24px solid #E8FF3B",
          fontFamily: "Be Vietnam Pro",
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", background: "#E8FF3B", color: "#0A0A0A", padding: "6px 18px", fontSize: 26, fontWeight: 700 }}>
            {eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: title.length > 60 ? 58 : 74, fontWeight: 700, lineHeight: 1.1 }}>
            {truncate(title, 110)}
          </div>
          {subtitle && (
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#A1A1A1", lineHeight: 1.4 }}>
              {truncate(subtitle, 150)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#A1A1A1" }}>
          <span>~/{site.handle}</span>
          <span>{site.name}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Be Vietnam Pro", data: await bold, weight: 700, style: "normal" },
        { name: "Be Vietnam Pro", data: await regular, weight: 400, style: "normal" },
      ],
    },
  );
}
