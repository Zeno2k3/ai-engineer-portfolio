import { buildSearchIndex } from "@/lib/search";

// Tạo một lần lúc build thành file tĩnh.
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
