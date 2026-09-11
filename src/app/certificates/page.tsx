import type { Metadata } from "next";
import { CertificatesList } from "@/components/list-pages";
import { PageHeader } from "@/components/section-heading";
import { getCredentials, getRoadmap } from "@/lib/content";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Chứng chỉ & Khoá học",
  description: "Các chứng chỉ đã đạt và khoá học đang theo trên hành trình AI Engineer.",
  alternates: { canonical: "/certificates" },
};

export default function CertificatesPage() {
  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader
        label="Certificates"
        title="Chứng chỉ & Khoá học"
        description="Các chứng chỉ đã đạt và khoá học đang theo. Mỗi khoá học gắn với một giai đoạn trong lộ trình."
      />
      <CertificatesList credentials={getCredentials()} stages={getRoadmap()} />
    </div>
  );
}
