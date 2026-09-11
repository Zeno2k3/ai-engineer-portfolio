import type { Metadata } from "next";
import { Suspense } from "react";
import { RoadmapView } from "@/components/roadmap-view";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "Lộ trình học" };

export default function RoadmapPage() {
  return (
    <Suspense>
      <RoadmapView posts={getAllPosts()} />
    </Suspense>
  );
}
