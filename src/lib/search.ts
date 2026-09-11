import { getProjects, getRoadmap } from "@/lib/content";
import { getAllPosts, getAllTags } from "@/lib/posts";
import type { SearchItem } from "@/lib/search-client";

const PAGES: [string, string][] = [
  ["Trang chủ", "/"],
  ["Dự án", "/work"],
  ["Blog", "/blog"],
  ["Lộ trình học", "/roadmap"],
  ["Chứng chỉ & Khoá học", "/certificates"],
  ["Giới thiệu", "/about"],
  ["Now — mình đang làm gì", "/now"],
  ["Liên hệ", "/contact"],
];

/** Chỉ mục tìm kiếm cho ⌘K và /search — tạo lúc build từ nội dung trong content/. */
export function buildSearchIndex(): SearchItem[] {
  return [
    ...PAGES.map(([title, href]): SearchItem => ({ title, href, kind: "Trang" })),
    ...getAllPosts().map(
      (post): SearchItem => ({
        title: post.title,
        href: `/blog/${post.slug}`,
        kind: "Bài viết",
        description: post.description,
        keywords: post.tags.join(" "),
      }),
    ),
    ...getProjects().map(
      (project): SearchItem => ({
        title: project.title,
        href: `/work/${project.slug}`,
        kind: "Dự án",
        description: project.tagline,
        keywords: [project.domain, ...project.stack].join(" "),
      }),
    ),
    ...getRoadmap().map(
      (stage): SearchItem => ({
        title: stage.title,
        href: `/roadmap/${stage.id}`,
        kind: "Lộ trình",
        description: stage.description,
        keywords: stage.topics.map((topic) => topic.name).join(" "),
      }),
    ),
    ...getAllTags().map(
      ({ tag, count }): SearchItem => ({
        title: `#${tag}`,
        href: `/tags/${encodeURIComponent(tag)}`,
        kind: "Tag",
        description: `${count} bài viết`,
      }),
    ),
  ];
}
