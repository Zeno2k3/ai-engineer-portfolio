// Render MDX phía server lúc build: Shiki tô màu code, KaTeX cho công thức (chỉ khi frontmatter có math: true).

import "katex/dist/katex.min.css";
import { MDXRemote, type MDXRemoteOptions } from "next-mdx-remote-client/rsc";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

type MdxOptions = NonNullable<MDXRemoteOptions["mdxOptions"]>;

const components = { Callout, pre: CodeBlock };

function mdxOptions(math: boolean): MdxOptions {
  return {
    // Chỉ bật cú pháp $…$ khi bài cần — tránh biến ký hiệu "$" thường thành công thức.
    remarkPlugins: math ? [remarkGfm, remarkMath] : [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      ...(math ? [rehypeKatex] : []),
      [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false }],
    ],
  };
}

export function MdxContent({ source, math = false }: { source: string; math?: boolean }) {
  return (
    <div className="prose post-prose max-w-none">
      <MDXRemote source={source} components={components} options={{ mdxOptions: mdxOptions(math) }} />
    </div>
  );
}
