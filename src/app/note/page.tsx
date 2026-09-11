import type { Metadata } from "next";
import { Suspense } from "react";
import { NoteView } from "@/components/note-view";

export const metadata: Metadata = { title: "Ghi chú" };

export default function NotePage() {
  return (
    <Suspense>
      <NoteView />
    </Suspense>
  );
}
