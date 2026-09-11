import type { Metadata } from "next";
import { BlogFeed } from "@/components/content-sections";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ghi chú học AI Engineering: LLM, RAG, Agents, Evals.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Blog</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">Ghi chú học tập</h1>
      <BlogFeed posts={getAllPosts()} />
    </div>
  );
}
