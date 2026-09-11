import Link from "next/link";
import { PostList } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";
import { buttonPrimary, buttonSecondary, containerClass } from "@/lib/ui";

export default function NotFound() {
  const latest = getAllPosts().slice(0, 3);

  return (
    <div className={`${containerClass} py-16 sm:py-24`}>
      <p className="font-display text-[clamp(6rem,22vw,14rem)] leading-none font-semibold text-fg" aria-hidden>
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-fg">Không tìm thấy trang này</h1>
      <p className="mt-4 max-w-[65ch] text-lg text-muted">
        Link có thể đã đổi hoặc bị gõ sai. Thử tìm bằng{" "}
        <kbd className="border border-border px-1.5 font-mono text-sm text-fg">Ctrl</kbd> +{" "}
        <kbd className="border border-border px-1.5 font-mono text-sm text-fg">K</kbd>, hoặc đọc bài mới nhất bên dưới.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/" className={buttonPrimary}>
          Về trang chủ
        </Link>
        <Link href="/search" className={buttonSecondary}>
          Tìm kiếm
        </Link>
      </div>
      {latest.length > 0 && (
        <section aria-labelledby="bai-moi" className="mt-16 max-w-3xl">
          <h2 id="bai-moi" className="mb-4 font-mono text-xs uppercase tracking-widest text-subtle">
            Bài mới nhất
          </h2>
          <PostList posts={latest} />
        </section>
      )}
    </div>
  );
}
