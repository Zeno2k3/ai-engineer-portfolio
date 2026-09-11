# Portfolio + Blog — Hành trình AI Engineer

Next.js 16 (App Router, build tĩnh) · MDX · Shiki · KaTeX · Tailwind CSS 4. Spec sản phẩm: [docs/product.md](docs/product.md).

## Chạy local

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build production (kiểm tra nội dung + TypeScript)
```

## Nội dung nằm ở đâu

Toàn bộ nội dung là **file trong thư mục `content/`** — site đọc chúng lúc build, nên ai vào site cũng thấy giống nhau.

| Nội dung | File | URL |
|---|---|---|
| Lộ trình học | `content/roadmap.json` | `/roadmap`, `/roadmap/<id>` |
| Chứng chỉ & khoá học | `content/credentials.json` | `/certificates`, `/about` |
| Dự án (case study) | `content/work/<slug>.mdx` | `/work/<slug>` |
| Bài viết | `content/blog/<slug>.mdx` | `/blog/<slug>` |
| Trang Now | `content/now.mdx` | `/now` |
| Thông tin cá nhân | `src/lib/site.ts` | mọi trang |

Định dạng từng trường được kiểm tra bằng schema trong `src/lib/schema.ts`: gõ sai (ví dụ tháng không phải `MM/YYYY`) thì `npm run build` dừng lại và báo rõ file + trường nào sai.

## Cách sửa nội dung

**Cách 1 — sửa file trực tiếp:** mở file trong `content/`, sửa, rồi:

```bash
git add content
git commit -m "Thêm chứng chỉ X"
git push          # Vercel tự build lại (~1 phút)
```

**Cách 2 — dùng form admin (chỉ chạy local):** `npm run dev` → mở `http://localhost:3000/admin`. Bấm **Lưu** sẽ ghi thẳng vào file trong `content/`; sau đó commit & push như trên. Trên bản production, `/admin` chỉ hiện hướng dẫn và không ghi được gì.

Frontmatter bài viết:

```yaml
---
title: "Tiêu đề (≤ 110 ký tự)"
description: "Mô tả ngắn (≤ 200 ký tự)"
date: 2026-09-11
updated: 2026-09-20      # tuỳ chọn
tags: [rag, llm]
stage: rag               # id giai đoạn lộ trình (tuỳ chọn)
series: "RAG từ con số 0" # tuỳ chọn, kèm seriesPart: 1
math: true               # bật KaTeX cho $…$
draft: true              # nháp: chỉ hiện khi chạy local
---
```

Trong MDX dùng được `<Callout type="note|info|tip|warn|danger">…</Callout>` và code block có tiêu đề/đánh dấu dòng: ` ```python title="main.py" {2-3} `.

## Biến môi trường

Xem [.env.example](.env.example): `NEXT_PUBLIC_SITE_URL` (domain), `RESEND_API_KEY` + `CONTACT_TO_EMAIL` (form liên hệ).
