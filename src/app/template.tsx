import { ViewTransition } from "react";

// template.tsx được tạo lại mỗi lần chuyển trang → nội dung cũ "exit", nội dung mới "enter".
// Hiệu ứng (crossfade ngắn) định nghĩa ở globals.css; header được giữ đứng yên; tắt khi prefers-reduced-motion.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}
