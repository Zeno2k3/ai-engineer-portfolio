import { renderOg } from "@/lib/og";
import { getAllPosts, getPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const alt = "Ảnh bìa bài viết";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Chỉ tạo ảnh cho slug có thật (không nhận tham số tuỳ ý → tránh bị lạm dụng).
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return renderOg({ eyebrow: "BLOG", title: post?.title ?? site.name, subtitle: post?.description });
}
