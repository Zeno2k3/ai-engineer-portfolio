# product.md — UI/UX Spec: Personal Portfolio + Blog cho AI Engineer

> Tài liệu sản phẩm (tiếng Việt). Định dạng Markdown, sẵn sàng lưu thành file `product.md`. Thuật ngữ kỹ thuật giữ nguyên tiếng Anh. Cập nhật đến 2026-09-11.

---

## 1. Tổng quan sản phẩm & Tuyên ngôn thiết kế (Design Manifesto)

Sản phẩm là một website cá nhân **kết hợp portfolio + blog kỹ thuật** trong cùng một codebase (không phải hai site tách rời), dành cho một AI/ML Engineer. Mục tiêu kép:
1. **Chứng minh năng lực kỹ thuật** — research projects, model work, LLM/agent systems, open-source, papers/writeups, demo tương tác, notebooks, benchmark/eval.
2. **Kênh phân phối nội dung** — blog kỹ thuật để xây dựng uy tín (authority) và thu hút traffic từ Google/HN/X.

**Voice của site:** *"Laboratory notebook của một kỹ sư"* — thô, chính xác, giàu dữ liệu, có tính thử nghiệm. Không "corporate", không "passionate about". Thẩm mỹ **neo-brutalist / editorial** CÓ KỶ LUẬT (disciplined brutalism), KHÔNG phải anti-design hỗn loạn.

Đây là quyết định dựa trên bằng chứng: nghiên cứu bình duyệt 2026 *"The impact of the brutalist approach to web design on user experience"* (Acta Graphica, Vol.34 No.1, 2026) chia brutalism thành hai nhánh — bản có kỷ luật (grid rõ ràng) đạt điểm usability hợp lý, còn **bản hỗn loạn (chaotic anti-design) có task success rate chỉ 8–10% trên trang nhiều thông tin — người dùng bỏ cuộc**. Ta chọn dứt khoát nhánh kỷ luật.

**7 nguyên tắc thiết kế (design principles):**
1. **Content-first, chrome-second.** Nội dung (chữ, code, metric) là kiến trúc chính. Kinetic typography chỉ là điểm nhấn có kiểm soát.
2. **Brutalism có kỷ luật.** Border 1–2px solid, hard shadow (offset đặc, blur 0), radius 0px hoặc pill, flat color, lộ grid. Không gradient mềm, không neumorphism.
3. **Monospace như signature.** Metadata, ngày, tag, nav dùng monospace; body dùng serif editorial để đọc dài dễ chịu.
4. **Motion phục vụ ý nghĩa.** Mọi animation phải truyền tải thứ bậc (hierarchy) hoặc phản hồi (feedback); luôn tôn trọng `prefers-reduced-motion`.
5. **Accessible by construction.** Nền đen trên màu bão hòa vốn dễ đạt contrast cao; ta khai thác nhưng vẫn kiểm tra WCAG 2.2 AA từng token.
6. **Evidence over adjectives.** Thay "expert in LLMs" bằng benchmark, eval số, repo link, demo chạy được.
7. **Fast & static.** SSG/ISR, RSC-first, JS tối thiểu. Performance là một phần của "cá tính".

---

## 2. Personas & User Journeys

| # | Persona | Mục tiêu | Entry point | Định nghĩa thành công |
|---|---------|----------|-------------|-----------|
| 1 | **Hiring manager kỹ thuật** (Eng Manager/Staff) | Đánh giá chiều sâu kỹ thuật trong ~2–3 phút | Link từ CV/LinkedIn → Home hoặc Work | Đọc 1–2 case study, mở repo/demo, lưu contact |
| 2 | **Recruiter không kỹ thuật** | Xác nhận seniority, stack, tình trạng tuyển | Home / About | Tải CV PDF, thấy "open to work", gửi form |
| 3 | **Đồng nghiệp engineer** (qua Google/HN/X) | Đọc một bài blog cụ thể | Post detail (deep link) | Đọc hết bài, RSS/subscribe, click bài liên quan |
| 4 | **Khách hàng/đối tác** (consulting) | Đánh giá độ tin cậy & lĩnh vực chuyên môn | Home / About / Now | Đọc case study, dùng contact flow |
| 5 | **Chính chủ (author)** | Viết & publish bài nhanh, ít ma sát | `/keystatic` hoặc git | Draft → preview → publish trơn tru |

**Journey 1 — Hiring manager (chi tiết):** Vào Home → hero nêu rõ *"AI Engineer, LLM/agent systems"* + 3 dự án nổi bật (bento grid) → click case study → đọc theo cấu trúc Problem → Data → Approach → Architecture → Eval → Kết quả → Bài học → thấy metric thật + repo → mở demo nhúng → dùng ⌘K tìm "RAG" → về About → lưu contact.
- **Edge case:** demo chết → hiện fallback video/GIF + "demo offline, xem code".

**Journey 3 — Engineer đọc blog:** Landing thẳng post từ Google → reading progress bar + sticky TOC → copy code block → xem công thức KaTeX → click footnote (preview) → cuối bài thấy series + related posts → RSS.
- **Empty state:** nếu bài thuộc series chưa hoàn thành → "Phần 3/5 — các phần sau sắp ra".

---

## 3. Information Architecture, Sitemap & URL Structure

```
/                       Home (hero + featured work + latest posts)
/work                   Projects index (filter theo lĩnh vực)
/work/[slug]            Case study detail
/blog                   Blog index (list + tag filter)
/blog/[slug]            Post detail
/tags/[tag]             Lọc bài theo tag
/series/[slug]          Trang series (multi-part)
/about                  About + resume/CV
/now                    Now page (đang làm gì)
/uses                   (tùy chọn) stack/tools
/contact                Contact flow
/search                 Trang search (Pagefind, có SearchAction)
/rss.xml /atom.xml /feed.json   Feeds
/sitemap.xml /robots.txt /llms.txt
/404                    Not found
```

**Nguyên tắc URL:** flat, kebab-case, KHÔNG ngày trong URL blog (dễ update), không đuôi `.html`. Canonical tuyệt đối HTTPS.

**Navigation pattern:**
- **Sticky top nav** (nền blur, border-bottom 1px) — lưu ý không che focus ring (WCAG 2.4.11).
- **Command palette ⌘K** (điều hướng + search hợp nhất).
- **Mega footer** (sitemap đầy đủ + social + RSS + "built with").

---

## 4. Luồng UX chi tiết từng flow (entry → happy path → edge/empty/error/loading)

### 4.1 Đọc blog post
- **Entry:** deep link, `/blog`, ⌘K, related posts.
- **Happy path:** header (title mono cỡ lớn, meta: ngày, reading time, tags) → sticky TOC (desktop, cột phải) + reading progress bar (top) → body serif → code blocks (Shiki: copy button, filename, line highlight, diff) → KaTeX → callouts/admonitions → footnotes → series nav → related posts → RSS CTA.
- **Loading:** SSG nên gần như instant; ảnh dùng blur placeholder; TOC render server-side (không CLS).
- **Empty:** bài ngắn không có heading → ẩn cột TOC, mở rộng body full-width.
- **Error:** slug sai → 404 brutalist với ⌘K + "bài mới nhất". Ảnh lỗi → alt text + khung border.

### 4.2 Xem case study
- **Entry:** `/work`, Home featured, ⌘K.
- **Happy path:** hero (tên dự án, 1 dòng tagline, stack chips mono) → **metric bar** (KPI lớn: "p99 −60%", "F1 0.91") → Problem → Data → Approach → Architecture (diagram) → Eval/Metrics (bảng + biểu đồ) → Kết quả → Bài học → links (repo, paper, demo).
- **Edge case NDA / công việc không public:** badge "Confidential / NDA"; mô tả ở mức trừu tượng (vấn đề + cách tiếp cận, KHÔNG lộ data/khách hàng); ẩn repo; ghi "Chi tiết theo yêu cầu".
- **Live demo:** nhúng iframe/HF Space; nếu offline → fallback GIF + link code.

### 4.3 Search (⌘K + /search)
- **Entry:** phím ⌘K bất kỳ đâu, hoặc `/search`.
- **Happy path:** gõ → kết quả instant (Pagefind, chạy client, không log query) → Enter điều hướng.
- **Empty:** "Không có kết quả cho '…'" + gợi ý tag phổ biến + link `/blog`.
- **Loading:** index load lazy qua Web Worker; skeleton < 200ms.
- **Edge:** typo → Pagefind fallback prefix (không fuzzy mạnh như Algolia — xem Caveats).

### 4.4 Contact
- **Entry:** nav, footer, About.
- **Happy path:** form (name + email + message) xử lý **server-side + spam filter** → toast success. Có status "open to work / not taking clients". Tránh raw `mailto:` (spam) và tránh chỉ có Calendly.
- **Error:** validate inline, giữ nội dung đã gõ; nếu API lỗi → hiện email fallback đã obfuscate.

---

## 5. Design System

### 5.1 Color tokens (dark-first, có contrast check)

Cơ sở lựa chọn palette: theo phân tích của The Plus Addons for Elementor (tính bằng công thức relative-luminance WCAG 2.1), phong cách đen-trên-màu-bão-hòa vốn dễ đạt contrast cao — **cặp yếu nhất "black on hot pink" đo được 7.93:1 vẫn vượt AAA, cặp mạnh nhất đạt 21:1 (giới hạn lý thuyết tối đa)**. Ta khai thác đặc tính này để vừa "brutalist" vừa accessible.

| Token | Hex | Dùng cho | Contrast |
|-------|-----|----------|----------|
| `--bg` | `#0A0A0A` | nền chính | — |
| `--surface` | `#141414` | card | — |
| `--fg` | `#F5F5F0` | text chính | ~18:1 trên `--bg` (vượt AAA) |
| `--fg-muted` | `#A1A1A1` | meta | ~7:1 (AA/AAA) |
| `--accent` | `#E8FF3B` (lime) | CTA, highlight | đen `#0A0A0A` trên lime ~17:1 |
| `--accent-2` | `#FF4D6D` (hot pink) | tag, link hover | đen trên pink ≈ 7.9:1 (AAA) |
| `--border` | `#2A2A2A` | border 1px | ≥3:1 non-text (AA) |
| `--code-bg` | `#0E0E12` | code block | — |

**Quy tắc bắt buộc:** text trên accent LUÔN là `#0A0A0A` (đen), KHÔNG dùng text trắng trên lime/pink. Light mode: đảo `--bg`→`#FAFAF7`, `--fg`→`#0A0A0A`, giữ accent nhưng text-on-accent vẫn đen (vẫn pass AAA).

### 5.2 Typography scale

**Fonts (đều miễn phí, SIL OFL):**
- **Body/reading:** `Newsreader` (Production Type, Google Fonts đặt riêng cho long-form on-screen) HOẶC `Fraunces` (variable, trục weight + optical-size + "wonk"/"softness"). Serif editorial tạo cá tính, dễ đọc dài.
- **Heading/display:** `Fraunces` variable (weight + opsz) cho kinetic typography.
- **Mono (signature):** `JetBrains Mono` (tối ưu cho code) cho meta, tag, code inline; hoặc `Space Grotesk`/`Space Mono` cho display technical.

**Reading measurements (có nguồn học thuật/chuyên môn):**
- **Line length (measure):** target **~66 ký tự/dòng** (`max-width: 65ch`), chấp nhận **50–75 CPL** (Baymard Institute, dẫn Emil Ruder), tối đa **80 CPL** (WCAG 1.4.8). Butterick: 45–90 CPL.
- **Body font-size:** **18–21px** (dùng `rem`; Butterick khuyến nghị 15–25px cho web). Luôn ≥16px trên `<input>` để tránh iOS auto-zoom (Josh Comeau).
- **Line-height body:** **1.5** unitless (Butterick 120–145%; WCAG 1.4.12 yêu cầu support ≥1.5). Heading 1.1–1.2.
- **Paragraph spacing:** ~1–1.5em; thiết kế phải chịu được override 2em (WCAG 1.4.12). Dùng khoảng cách HOẶC first-line indent, không dùng cả hai (Butterick).

Scale (rem, ratio ~1.25 major third):
```
--text-xs:   0.8rem     (≈12.8px) meta mono
--text-sm:   0.9rem     nhãn
--text-base: 1.1875rem  (19px) body
--text-lg:   1.5rem
--text-xl:   2.25rem
--text-2xl:  3.5rem
--text-hero: clamp(3rem, 10vw, 8rem)  kinetic display (vw-scaled)
```

### 5.3 Spacing scale (8px base)
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128` (px) → token `--space-1..10`.

### 5.4 Grid
12-col desktop (container max-width 1200px, gutter 24px), 4-col mobile. **Bento grid** cho Home featured: card kích thước không đều, lộ đường grid 1px (đúng ngôn ngữ brutalist).

### 5.5 Border / Shadow / Noise
- Border: `1px solid var(--border)`; nhấn mạnh `2px solid var(--fg)`.
- **Hard shadow:** `box-shadow: 6px 6px 0 0 var(--fg);` (offset đặc, blur 0). Hover: co còn `3px 3px` + dịch element (cảm giác "được nhấn").
- **Noise/grain:** SVG `feTurbulence` overlay `opacity: 0.03–0.05`, `pointer-events: none`, `mix-blend-mode: overlay` — không được làm giảm contrast text.

### 5.6 Motion tokens
```
--dur-fast:  120ms     hover, tap feedback
--dur-base:  240ms     enter/exit, layout
--dur-slow:  480ms     page/hero
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)     (expo-out, default)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--ease-spring: Motion type:spring, stiffness 300, damping 30 (gesture)
```

---

## 6. Component Inventory

| Component | Trạng thái | Props chính |
|-----------|-----------|-------------|
| `Nav` (sticky) | default, scrolled, mobile-open | `activePath` |
| `CommandPalette` (⌘K) | closed, open, searching, empty | `items`, `onSelect` |
| `HeroKinetic` | default, reduced-motion | `title`, `subtitle` |
| `BentoGrid` / `ProjectCard` | default, hover, focus | `title`, `metrics`, `tags`, `href`, `nda?` |
| `MetricBar` | default | `label`, `value`, `delta` |
| `CodeBlock` (Shiki) | default, copied, line-highlight | `lang`, `filename`, `highlightLines`, `diff?` |
| `Callout` | info / warn / danger / note | `type`, `title` |
| `Footnote` / `FootnoteRef` | default, hover-preview | `id` |
| `TOC` (sticky) | default, active-section | `headings` |
| `ReadingProgress` | 0–100% | — |
| `Math` (KaTeX) | inline, block | `expr` |
| `DemoEmbed` | live, loading, offline-fallback | `src`, `fallbackImg` |
| `TagFilter` | default, active, empty | `tags`, `selected` |
| `SeriesNav` | default | `parts`, `current` |
| `RelatedPosts` | default, empty | `posts` |
| `ContactForm` | idle, submitting, success, error | `onSubmit` |
| `ThemeToggle` | dark, light, system | — |
| `Toast` | success, error | `message` |
| `Footer` (mega) | default | — |
| `EmptyState` / `ErrorState` / `Skeleton` | — | `variant` |

---

## 7. Đặc tả từng trang (Page Spec)

- **Home:** hero kinetic (tên + role + 1 dòng); bento 3–4 featured projects (mỗi cái kèm 1 metric); "Latest writing" 3 bài; strip "currently" link `/now`; CTA contact. **KHÔNG** hero chung chung, **KHÔNG** skills bar %.
- **Work index (`/work`):** grid case study, filter theo lĩnh vực (LLM, CV, RL, Infra, OSS), mỗi card: title + 1 metric + stack chips. Empty state khi filter rỗng.
- **Case study (`/work/[slug]`):** như flow 4.2. JSON-LD `SoftwareSourceCode` (dự án OSS) + `BreadcrumbList`.
- **Blog index (`/blog`):** list (title mono lớn + ngày + reading time + tags), tag filter, phân trang/infinite scroll. RSS link rõ.
- **Post detail (`/blog/[slug]`):** như flow 4.1. JSON-LD `BlogPosting`.
- **About (`/about`):** tiểu sử ngắn (KHÔNG "passionate"), timeline gọn (2–4 vai trò, mỗi cái 1 bullet impact), CV PDF download, JSON-LD `Person` + `ProfilePage`, `sameAs` GitHub/LinkedIn.
- **Now (`/now`):** đang làm gì, cập nhật thủ công, có "last updated".
- **Contact (`/contact`):** form server-side + status open-to-work.
- **404:** brutalist, ⌘K, link bài mới nhất.
- **Search (`/search`):** Pagefind UI, JSON-LD `WebSite` + SearchAction (lưu ý deprecation ở §11).
- **RSS/Atom/JSON feed:** generate ở build time.

---

## 8. Motion Spec

**Quyết định thư viện (khuyến nghị):** dùng kết hợp theo đúng công cụ cho đúng việc:
- **Motion** (tên mới của Framer Motion, đổi thương hiệu 2025) cho **UI React**: enter/exit, layout animation, gesture, ⌘K, `AnimatePresence`. Dùng pattern `LazyMotion + m` để ship khởi đầu ~4.6KB.
- **CSS scroll-driven animations native** (`animation-timeline: scroll()` / `view()`, hỗ trợ >90% trình duyệt) cho reveal/parallax đơn giản — zero JS, không chặn main thread.
- **GSAP + ScrollTrigger** CHỈ khi cần scroll-storytelling phức tạp (pinning, scrubbed timeline). Lưu ý: **GSAP đã miễn phí 100% từ 30/4/2025** — sau khi Webflow mua lại GreenSock (15/10/2024) — bao gồm mọi plugin từng trả phí (SplitText, MorphSVG, DrawSVG, ScrollSmoother), kể cả dùng thương mại.

**Page transition:** dùng **View Transitions API** (native). Next.js App Router: thư viện `next-view-transitions` hoặc React `<ViewTransition>` (experimental). Giữ số element có `view-transition-name` **< 20/transition** để tránh jank trên Android tầm trung; chỉ animate `transform`/`opacity`.

**Motion hierarchy:** hero display (slow, expo-out) → section reveal (base, `view()`) → micro-interaction hover/tap (fast). Stagger 40–60ms giữa các item trong list.

**`prefers-reduced-motion`:** tắt kinetic/parallax/scroll-driven, chỉ giữ opacity fade ≤120ms hoặc bỏ hẳn. Bọc animation trong `@media (prefers-reduced-motion: no-preference)`.

**Khi motion phản tác dụng:** parallax quá đà gây CLS/jank; animation chặn việc đọc; scroll-hijack; đặt motion trên element trong list dài; snapshot View Transitions quá nặng. **Nguyên tắc kiểm soát:** nếu đo thấy INP/CLS tăng → bỏ.

---

## 9. Accessibility Checklist (WCAG 2.2 AA)

- [ ] Contrast text ≥ 4.5:1 (body), ≥ 3:1 (large text / non-text) — đã check ở §5.1.
- [ ] **2.4.11 Focus Not Obscured (AA):** sticky nav / cookie banner không che focus ring khi tab.
- [ ] **2.4.13 Focus Appearance:** focus ring rõ (≥3:1 so với trạng thái unfocused), dày ≥2px.
- [ ] **2.5.8 Target Size Minimum (AA):** hit target ≥ **24×24px CSS** (hoặc spacing đủ theo quy tắc vòng tròn 24px).
- [ ] **2.5.7 Dragging Movements (AA):** mọi thao tác kéo (slider, reorder) có phương án click/tap.
- [ ] **3.2.6 Consistent Help / 3.3.7 Redundant Entry / 3.3.8 Accessible Authentication (Min).**
- [ ] Keyboard nav toàn bộ (⌘K, nav, form, code copy) + skip-link.
- [ ] Screen reader: landmark, heading order đúng, alt text, code block dùng `<pre><code>`, KaTeX có MathML ẩn.
- [ ] `prefers-reduced-motion` được tôn trọng.
- [ ] Chữ mono nhỏ ≥ 12.8px; noise opacity thấp không giảm contrast.
- [ ] Không dùng CHỈ màu để truyền tải thông tin.
- [ ] Zoom 200% không vỡ layout; text-spacing override (1.4.12) không mất nội dung.
- [ ] axe/Lighthouse: 0 lỗi critical.

---

## 10. Performance Budget & kỹ thuật đạt được

**Mục tiêu Core Web Vitals (đo ở p75 field data — CrUX):** Ngưỡng "good" chính thức của Google (web.dev, đánh giá ở 75th percentile) là **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1** — INP đã thay FID làm metric phản hồi chính thức từ 12/3/2024. **Mục tiêu stretch của site này chặt hơn:** LCP ≤ 2.0s, INP ≤ 150ms, CLS ≤ 0.05. Lighthouse ≥ 95 mọi category.

**Bundle budget:** JS first-load ≤ 100KB gzip cho route blog; ảnh hero ≤ 150KB (AVIF/WebP).

**Kỹ thuật:**
- **Fonts:** variable font, subset Latin, `font-display: swap`, preload font body, self-host. (Ví dụ: Inter latin subset ~50KB thay vì ~320KB full.)
- **Syntax highlighting:** **Shiki** build-time (TextMate grammar của VS Code) → **zero client JS, không FOUC màu, không layout shift**. Prism nhẹ nhưng chạy client-side gây flash. Shiki chậm ~7× Prism nhưng chạy ở BUILD nên không ảnh hưởng runtime. Dùng `@shikijs/rehype` + `rehype-pretty-code`.
- **Math:** **KaTeX** render server/build-time (nhanh hơn MathJax, bundle nhỏ, có MathML ẩn cho screen reader). Chỉ chuyển sang MathJax nếu thật sự cần `\label`/`\eqref`.
- **Images:** `next/image`, AVIF, blur placeholder, kích thước cố định (chống CLS).
- **RSC vs client boundary:** mặc định Server Component; `"use client"` CHỈ cho ⌘K, ThemeToggle, CodeBlock copy, DemoEmbed, ContactForm, motion components.
- **Rendering:** SSG cho blog/case study; ISR khi cần cập nhật; static export nơi có thể.
- **Search:** Pagefind index tĩnh, load qua Web Worker, không backend, không query logging.

---

## 11. SEO & Metadata Spec

- **Metadata:** Next.js `generateMetadata` per route (title template, description, canonical tuyệt đối HTTPS).
- **OG image động:** dùng `ImageResponse` từ `next/og` (App Router built-in — nội bộ là `@vercel/og` + Satori + Resvg → PNG). Đặt `opengraph-image.tsx` trong `blog/[slug]` + `twitter-image.tsx`. Canvas **1200×630**, chữ cách mép an toàn, load font ở module level (cache per edge instance). Chỉ dùng dữ liệu public (slug ổn định, không nhận query tuỳ ý → tránh injection/abuse). *Lưu ý: OG image tăng CTR khi share nhưng KHÔNG phải ranking factor trực tiếp.*

- **JSON-LD (bắt buộc render server-side để index được — client-side injection không đáng tin cho indexing):**
  - **`BlogPosting`:** Theo Google Search Central, type này **không có field bắt buộc**; nhưng các field thực sự tạo rich result và nên coi như "de-facto required" là: `headline` (≤110 ký tự), `image` (nhiều ảnh ≥1200px, tỉ lệ 16:9/4:3/1:1, ≥50K pixel), `datePublished`/`dateModified` (ISO 8601 + timezone), `author` (kiểu `Person`, mỗi tác giả 1 object, chỉ đặt `name` + thêm `url`/`sameAs`). `wordCount`/`keywords` là schema.org hợp lệ nhưng **Google không dùng cho Article rich result** — vẫn thêm để phục vụ AI/LLM crawler.
  - **`Person` + `ProfilePage`** cho About; `sameAs` GitHub/LinkedIn để disambiguate entity trong Knowledge Graph.
  - **`SoftwareSourceCode`** cho dự án OSS: `codeRepository`, `programmingLanguage`, `runtimePlatform`, `license`, `version`. **Lưu ý: Google KHÔNG có rich result cho type này** — validate bằng `validator.schema.org`, KHÔNG phải Rich Results Test.
  - **`BreadcrumbList`** (có rich result thật; `ListItem` cuối có thể bỏ `item`).
  - **`WebSite` + `SearchAction`:** **Google đã deprecate Sitelinks Search Box từ 21/11/2024** (thông báo 21/10/2024): *"We're saying bye to the sitelinks search box… The corresponding markup doesn't need to be removed, but won't be used by Google."* Markup vẫn hợp lệ, không gây lỗi Search Console. Chỉ giữ nếu có on-site search; `WebSite.name` vẫn ảnh hưởng tên site hiển thị SERP.

- **Ví dụ BlogPosting JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.com/blog/vector-db-latency" },
  "headline": "Cutting Vector DB Query Latency by 60% with HNSW Tuning",
  "image": ["https://example.com/blog/hnsw/cover-16x9.jpg", "…4x3.jpg", "…1x1.jpg"],
  "datePublished": "2026-03-04T09:00:00+00:00",
  "dateModified": "2026-03-06T14:30:00+00:00",
  "author": { "@type": "Person", "name": "Alex Rivera", "url": "https://example.com/about",
    "sameAs": ["https://github.com/alexrivera", "https://linkedin.com/in/alexrivera"] },
  "wordCount": 2140,
  "keywords": ["vector database", "HNSW", "RAG", "latency optimization"],
  "inLanguage": "en-US"
}
```

- **`sitemap.xml`, `robots.txt`, canonical** đầy đủ. **RSS/Atom/JSON feed** cho engineer subscribe.
- **`llms.txt`:** thêm file Markdown ở root map nội dung tốt nhất. **Đánh giá thẳng thắn:** đây là đề xuất của **Jeremy Howard (Answer.AI/fast.ai), công bố 3/9/2024**; tính đến 2026 **không major LLM nào crawl theo lịch production**; **Google (Gary Illyes, Search Central Live 7/2025) xác nhận không hỗ trợ và không có kế hoạch hỗ trợ** (John Mueller ví như thẻ meta keywords đã lỗi thời). Giá trị thực tế hiện tại: **developer tooling** (Cursor, Copilot) fetch docs. Chi phí ~1 giờ → nên có như "hygiene", đừng kỳ vọng SEO.
- **Distribution:** share X/LinkedIn/HN với OG image đẹp.

---

## 12. Content Model / Frontmatter Schema

**Tooling quyết định (khuyến nghị chính):** **Velite** làm content layer — type-safe (Zod-based), tương thích Next.js App Router + RSC, được bảo trì tích cực, tự tính reading time/slug/toc. Đây là **lựa chọn thay thế Contentlayer** — vốn **đã ngừng phát triển từ 2023 và lỗi tương thích với Next.js 14+**. Các lựa chọn khác: **Content Collections / Fumadocs** (docs-like, MDX components phong phú); **next-mdx-remote** (khi cần nguồn remote DB/CMS/API). Khuyến nghị stack nội dung: **Velite + Shiki + KaTeX**.

**CMS (tùy chọn):** **Keystatic** (git-based, không DB, UI tại `/keystatic`, schema TypeScript, có GitHub mode để edit qua web không cần local) — hợp nhất cho blog kỹ thuật cá nhân, chi phí hạ tầng 0đ. Chuyển sang **Sanity** nếu cần editorial nâng cao/real-time/multi-locale.

**Frontmatter schema (Velite/Zod):**
```typescript
import { defineConfig, defineCollection, s } from 'velite'

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s.object({
    title: s.string().max(110),            // ≤110 cho SEO headline
    slug: s.slug('post'),
    description: s.string().max(200),
    date: s.isodate(),
    updated: s.isodate().optional(),
    draft: s.boolean().default(false),
    tags: s.array(s.string()).default([]),
    series: s.string().optional(),
    seriesPart: s.number().optional(),
    cover: s.image().optional(),
    math: s.boolean().default(false),      // chỉ load KaTeX CSS khi cần
    metadata: s.metadata(),                // reading time, wordCount tự tính
    toc: s.toc(),
    body: s.mdx(),
  }),
})

const projects = defineCollection({
  name: 'Project',
  pattern: 'work/**/*.mdx',
  schema: s.object({
    title: s.string(),
    slug: s.slug('project'),
    tagline: s.string(),
    domain: s.enum(['LLM', 'CV', 'RL', 'Infra', 'OSS']),
    stack: s.array(s.string()),
    metrics: s.array(s.object({
      label: s.string(), value: s.string(), delta: s.string().optional(),
    })),
    repo: s.string().url().optional(),
    paper: s.string().url().optional(),
    demo: s.string().url().optional(),
    nda: s.boolean().default(false),
    year: s.number(),
    body: s.mdx(),
  }),
})

export default defineConfig({ collections: { posts, projects } })
```

**Ví dụ MDX với callout + code + math:**
```mdx
---
title: "Why We Fine-Tune: A Practical Guide"
date: 2026-02-10
tags: [llm, fine-tuning]
math: true
---

<Callout type="warn">Fine-tune chỉ khi RAG + prompt đã hết dư địa.</Callout>

Loss được tính: $\mathcal{L} = -\sum_i y_i \log \hat{y}_i$

```python title="train.py" {3-4}
model = AutoModel.from_pretrained("base")
optimizer = AdamW(model.parameters(), lr=2e-5)
for batch in loader:          # dòng highlight
    loss = model(**batch).loss
```
```

---

## 13. Tech Stack & Kiến trúc thư mục Next.js App Router

**Stack:** Next.js 15 (App Router, RSC) · TypeScript · **Velite** · MDX · **Shiki** (`@shikijs/rehype`) · **KaTeX** (`rehype-katex` + `remark-math`) · **Motion** + CSS scroll-driven · **Pagefind** · **Keystatic** (tùy chọn) · Tailwind CSS (token brutalist custom) · host Vercel/Cloudflare · **Plausible/Umami** analytics.

```
├─ app/
│  ├─ layout.tsx              (ViewTransitions, theme, nav, footer)
│  ├─ page.tsx                (Home)
│  ├─ globals.css             (tokens, noise SVG, scroll-driven keyframes)
│  ├─ work/
│  │  ├─ page.tsx
│  │  └─ [slug]/
│  │     ├─ page.tsx
│  │     └─ opengraph-image.tsx
│  ├─ blog/
│  │  ├─ page.tsx
│  │  └─ [slug]/
│  │     ├─ page.tsx
│  │     ├─ opengraph-image.tsx
│  │     └─ twitter-image.tsx
│  ├─ tags/[tag]/page.tsx
│  ├─ series/[slug]/page.tsx
│  ├─ about/page.tsx
│  ├─ now/page.tsx
│  ├─ contact/page.tsx
│  ├─ search/page.tsx
│  ├─ rss.xml/route.ts
│  ├─ sitemap.ts
│  └─ not-found.tsx
├─ components/
│  ├─ mdx/  (CodeBlock, Callout, Math, DemoEmbed, Footnote)
│  ├─ CommandPalette.tsx  Nav.tsx  Footer.tsx  TOC.tsx
│  ├─ ReadingProgress.tsx  BentoGrid.tsx  MetricBar.tsx  …
├─ content/  (blog/  work/)           ← nguồn Velite/Keystatic
├─ .velite/                            ← output typed (generated)
├─ lib/  (og.ts  schema-jsonld.ts  feed.ts  pagefind.ts)
├─ keystatic.config.ts
├─ public/  (fonts/  llms.txt  robots.txt)
├─ mdx-components.tsx
├─ velite.config.ts
└─ next.config.mjs
```

---

## 14. Roadmap triển khai theo Phase

| Phase | Nội dung | Effort ước lượng |
|-------|----------|------------------|
| **MVP** | Home; Blog index + detail (Velite + Shiki + KaTeX); About; 404; RSS; SEO metadata + `BlogPosting` JSON-LD; dark mode; deploy | ~2–3 tuần |
| **v1** | Work index + case study (metric + NDA handling); ⌘K + Pagefind; OG image động; motion (Motion + View Transitions); contact form server-side; tag filter; analytics; sitemap/robots/llms.txt | ~2–3 tuần |
| **v1.5** | Series/multi-part; related posts; kinetic hero + scroll-driven; Keystatic CMS; footnote hover-preview; digital-garden backlinks (tùy chọn); newsletter; GSAP storytelling (nếu cần) | ~2–4 tuần |

---

## 15. Acceptance Criteria / Definition of Done

**MVP DoD:** Lighthouse ≥ 95; LCP < 2.5s & CLS < 0.1 trên field; blog render MDX + code + math đúng; RSS hợp lệ; `BlogPosting` JSON-LD pass Rich Results Test; dark mode không FOUC; keyboard nav + skip-link; deploy production.

**v1 DoD:** ⌘K điều hướng + search hoạt động; OG image render đúng per-post (validate bằng công cụ debug X/Facebook); case study có metric + NDA badge; contact form gửi được + spam filter + đủ states; motion tôn trọng reduced-motion; INP < 200ms; WCAG 2.2 AA pass (axe 0 critical).

**v1.5 DoD:** series nav đúng thứ tự; Keystatic publish flow không lỗi; scroll-driven không jank (< 20 named transitions/transition); newsletter double-opt-in.

---

## 16. Metrics thành công (KPI)

- **Engagement:** median reading time ≥ 60% ước tính bài; scroll-depth "read complete" ≥ 40% với bài dài.
- **Performance:** ≥ 75% page views đạt "good" cả 3 CWV (điều kiện Google pass).
- **Conversion:** tỉ lệ hiring manager → contact/CV download; số RSS subscribers tăng theo quý.
- **SEO:** bài kỹ thuật được index & xuất hiện rich result (breadcrumb); tăng organic + AI-referral traffic.
- **Quality/Freshness:** 0 broken demo/link (check hàng tháng); xuất bản ≥ 1 bài/tháng (tránh "blog bỏ hoang").

---

## 17. Anti-patterns & Rủi ro

**Tránh (cụ thể cho portfolio dev/AI):**
- **Hero chung chung** — "passionate full-stack developer who loves solving problems" xuất hiện trên hàng triệu trang, không ai nhớ.
- **Skills bar %** ("JavaScript 87%") — số tự gán, không ai tin; thay bằng grouped skills + nhãn "Primary/Secondary/Learning" hoặc dữ liệu thật (OSS contributions).
- **Quá nhiều project nhỏ** (todo/weather/calculator clone) — chọn 3–5 dự án thật, có eval và impact.
- **Animation vô nghĩa** gây jank/CLS; scroll-hijack.
- **Blog bỏ hoang** (bài cuối cách 2 năm) — hại uy tín hơn là không có blog.
- **Chaotic anti-design** (task success 8–10%).
- **Raw `mailto:`** (bị spam trong 48h) hoặc chỉ có Calendly.
- **Sai metric** (dùng accuracy cho imbalanced data — VD mô hình 99.8% accuracy bắt 0 fraud) — dùng precision/recall/F1/business cost.

**Rủi ro & giảm thiểu:**
- Brutalism làm giảm usability → giữ nhánh **kỷ luật**, test người dùng thật.
- Motion nặng trên mobile → `LazyMotion`, native CSS, < 20 named transitions.
- Pagefind typo-tolerance yếu (không fuzzy như Algolia) → chấp nhận cho blog/portfolio; nếu cần fuzzy mạnh → Orama/Meilisearch/Algolia.
- Contentlayer đã chết → dùng **Velite** ngay từ đầu.
- Kỳ vọng sai về `llms.txt` → coi là hygiene, không phải kênh SEO.
- Font brutalist chói/nhỏ/nhiễu → luôn check contrast + kích thước tối thiểu.

---

## 18. Nguồn tham khảo (link thật)

**Content layer & MDX**
- Wisp CMS — *Contentlayer has been Abandoned*: https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives
- PkgPulse — Contentlayer vs Velite vs next-mdx-remote: https://www.pkgpulse.com/guides/contentlayer-vs-velite-vs-next-mdx-remote-mdx-content-2026
- Dub — Migrating to Content Collections: https://dub.co/blog/content-collections
- next-mdx-remote: https://github.com/hashicorp/next-mdx-remote

**Rendering: code & math**
- PkgPulse — Shiki vs Prism vs highlight.js: https://www.pkgpulse.com/guides/shiki-vs-prismjs-vs-highlightjs-syntax-highlighting-2026
- chsm.dev — Comparing web code highlighters: https://chsm.dev/blog/2025/01/08/comparing-web-code-highlighters
- KaTeX vs MathJax — MkDocs Material: https://github.com/squidfunk/mkdocs-material/blob/master/docs/reference/math.md ; BigGo: https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison

**Motion**
- Shaheer Malik — GSAP vs Framer Motion: https://www.shaheermalik.com/compare/gsap-vs-framer-motion
- Mintec — Scroll-Driven Animations & View Transitions: https://mintec.co/blog/scroll-driven-view-transitions-css-2026/
- Next.js — View Transitions: https://nextjs.org/docs/app/guides/view-transitions ; next-view-transitions: https://github.com/shuding/next-view-transitions
- GSAP miễn phí (Webflow): https://gsap.com/blog/3-13

**SEO / Metadata / Schema**
- Next.js — ImageResponse: https://nextjs.org/docs/app/api-reference/functions/image-response ; OG images: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Google Search Central — Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- Google — Breadcrumb / ProfilePage / Intro: https://developers.google.com/search/docs/appearance/structured-data/
- schema.org: https://schema.org/BlogPosting , /Person , /SoftwareSourceCode , /BreadcrumbList , /WebSite , /docs/actions.html
- llms.txt: https://www.semrush.com/blog/llms-txt/ ; https://limy.ai/blog/llms-txt-in-2026-the-full-guide ; https://thegrowthgpt.com/resources/blogs/llms-txt-ai-crawler-guide

**Performance & Accessibility**
- web.dev — Defining Core Web Vitals thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds
- corewebvitals.io: https://www.corewebvitals.io/core-web-vitals
- W3C — WCAG 2.2: https://www.w3.org/TR/WCAG22/ ; TetraLogical: https://tetralogical.com/blog/2023/10/05/whats-new-wcag-2.2/ ; Level Access: https://www.levelaccess.com/blog/wcag-2-2-aa-summary-and-checklist-for-website-owners/

**Search & CMS & Analytics**
- Pagefind vs Algolia/Orama: https://staticsignal.io/posts/static-site-search-with-pagefind/ ; https://sarthakmishra.com/blog/astro-search-comparison
- Keystatic: https://www.pkgpulse.com/guides/payload-cms-v3-vs-keystatic-vs-outstatic-headless-cms-2026 ; https://www.luckymedia.dev/insights/keystatic
- Analytics privacy-first: https://www.pkgpulse.com/guides/vercel-analytics-vs-plausible-vs-umami-privacy-first-2026 ; https://scripts.nuxt.com/learn/privacy-first-analytics-compared

**Design trends & portfolio references**
- Neo-brutalism 2026: https://theplusaddons.com/blog/neo-brutalism-web-design/ ; https://fireart.studio/blog/the-best-web-design-trends/ ; https://medium.com/@designstudiouiux/neo-brutalism-web-design-what-it-is-why-it-works-and-when-to-use-it-f5d7932fa8ec
- Acta Graphica (2026) — brutalist UX study (bản peer-reviewed): actagraphica.hr Vol.34 No.1
- Rauno Freiberg: https://rauno.me ; Brittany Chiang: https://brittanychiang.com ; Josh Comeau: https://www.joshwcomeau.com ; Lil'Log (Lilian Weng): https://lilianweng.github.io
- Portfolio anti-patterns: https://showproof.io/guides/what-to-include-in-developer-portfolio/ ; https://dev.to/__be2942592/how-to-build-a-developer-portfolio-that-actually-gets-you-hired-2026-6kn

**Typography**
- Butterick's Practical Typography: https://practicaltypography.com/line-length.html , /line-spacing.html , /typography-in-ten-minutes.html
- Baymard Institute — line length: https://baymard.com/blog/line-length-readability
- Josh Comeau — Custom CSS Reset: https://www.joshwcomeau.com/css/custom-css-reset/

**Fonts (free, SIL OFL)**
- Influx — 25 best free fonts 2026: https://www.influxdigital.com/blog/best-free-fonts (Newsreader, Fraunces, Space Grotesk, Inter)
- Font Compressor — best free serif fonts: https://fontcompressor.com/blog/best-free-serif-fonts