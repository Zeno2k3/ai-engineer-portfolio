import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/section-heading";
import { SearchView } from "@/components/search-view";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  alternates: { canonical: "/search" },
  // Trang kết quả tìm kiếm không nên được index; vẫn cho bot đi theo link.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader label="Search" title="Tìm kiếm" />
      <Suspense>
        <SearchView />
      </Suspense>
    </div>
  );
}
