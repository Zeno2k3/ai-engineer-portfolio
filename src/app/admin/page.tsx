import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/admin-app";
import { getAllProjects, getCredentials, getProfile, getRoadmap } from "@/lib/content";
import { getEditablePosts } from "@/lib/posts";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className={`${containerClass} max-w-2xl py-24`}>
        <h1 className="text-3xl font-semibold text-fg">Trang admin chỉ chạy ở local</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Nội dung site nằm trong thư mục <code className="font-mono text-fg">content/</code> của repo. Để sửa: chạy{" "}
          <code className="font-mono text-fg">npm run dev</code> rồi mở <code className="font-mono text-fg">/admin</code>{" "}
          trên máy, hoặc sửa trực tiếp file trong <code className="font-mono text-fg">content/</code> — sau đó commit &
          push, Vercel sẽ tự build lại.
        </p>
      </div>
    );
  }

  return (
    <AdminApp
      initialData={{
        profile: getProfile(),
        roadmap: getRoadmap(),
        credentials: getCredentials(),
        projects: getAllProjects(),
        posts: getEditablePosts(),
      }}
    />
  );
}
