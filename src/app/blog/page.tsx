import type { Metadata } from "next";
import { PostList } from "@/components/post-card";
import { PageHeader } from "@/components/section-heading";
import { TagNav } from "@/components/tag-nav";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ghi chú học AI Engineering: LLM, RAG, Agents, Evals.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader
        label="Blog"
        title="Ghi chú học tập"
        description={`Những gì mình học được về AI Engineering — viết lại theo cách mình hiểu. ${posts.length} bài viết.`}
      />
      <TagNav tags={getAllTags()} />
      <div className="max-w-3xl">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
