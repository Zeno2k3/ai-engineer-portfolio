// Hàm tiện ích không phụ thuộc môi trường (dùng được ở server, client và admin).

/** Bỏ dấu tiếng Việt, đưa về chữ thường: dùng để so khớp tìm kiếm. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** "RAG & Vector Database" → "rag-vector-database". */
export function slugify(input: string): string {
  return normalizeText(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug chưa có trong `taken`; trùng thì thêm hậu tố -2, -3… */
export function uniqueSlug(base: string, taken: string[]): string {
  const root = base || "muc-moi";
  let slug = root;
  for (let i = 2; taken.includes(slug); i++) slug = `${root}-${i}`;
  return slug;
}

export function toTags(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return list.map((tag) => String(tag).trim().replace(/^#/, "")).filter(Boolean);
}

/** Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD. */
export function today(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** Escape ký tự đặc biệt cho XML (RSS). */
export function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
}
