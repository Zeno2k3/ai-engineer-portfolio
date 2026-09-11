"use client";

// Thay thẻ <pre> trong MDX: giữ nguyên HTML đã được Shiki tô màu lúc build, chỉ thêm nút copy.

import { useRef, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock(props: ComponentProps<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText.trimEnd() ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard bị chặn (http, iframe…) — bỏ qua, người dùng vẫn bôi đen để copy được.
    }
  }

  return (
    <div className="code-block relative">
      <pre ref={ref} {...props} />
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Đã copy code" : "Copy code"}
        className="absolute top-2 right-2 inline-flex h-8 cursor-pointer items-center gap-1.5 border border-border bg-surface px-2.5 font-mono text-xs text-muted transition-colors hover:border-fg hover:text-fg"
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        <span aria-live="polite">{copied ? "Đã copy" : "Copy"}</span>
      </button>
    </div>
  );
}
