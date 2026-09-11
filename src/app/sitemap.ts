import type { MetadataRoute } from "next";
import { getProjects, getRoadmap } from "@/lib/content";
import { absoluteUrl } from "@/lib/jsonld";
import { getAllPosts, getAllSeries, getAllTags } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.updated ?? posts[0]?.date;

  const pages = ["/", "/work", "/blog", "/roadmap", "/certificates", "/about", "/now", "/contact"].map((path) => ({
    url: absoluteUrl(path),
    ...(path === "/blog" && latest && { lastModified: latest }),
  }));

  return [
    ...pages,
    ...posts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.updated ?? post.date })),
    ...getProjects().map((project) => ({ url: absoluteUrl(`/work/${project.slug}`) })),
    ...getRoadmap().map((stage) => ({ url: absoluteUrl(`/roadmap/${stage.id}`) })),
    ...getAllTags().map(({ tag }) => ({ url: absoluteUrl(`/tags/${encodeURIComponent(tag)}`) })),
    ...getAllSeries().map((series) => ({ url: absoluteUrl(`/series/${series.slug}`) })),
  ];
}
