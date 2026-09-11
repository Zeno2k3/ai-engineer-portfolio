"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Render Markdown của ghi chú admin, dùng chung style với bài MDX.
export function MarkdownContent({ source }: { source: string }) {
  return (
    <div className="prose post-prose max-w-none">
      <Markdown remarkPlugins={[remarkGfm]}>{source}</Markdown>
    </div>
  );
}
