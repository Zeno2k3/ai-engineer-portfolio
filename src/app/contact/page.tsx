import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/section-heading";
import { site, socialLinks } from "@/lib/site";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ với ${site.name} để trao đổi về AI Engineering, dự án hoặc cơ hội làm việc.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const [user, domain] = site.email.split("@");
  const emailParts: [string, string] | null = user && domain ? [user, domain] : null;

  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <PageHeader
        label="Contact"
        title="Liên hệ"
        description="Muốn trao đổi về AI Engineering, góp ý bài viết hay rủ làm dự án chung? Để lại lời nhắn, mình sẽ trả lời qua email."
      />
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="max-w-2xl">
          <ContactForm emailParts={emailParts} />
        </div>
        <aside className="self-start border-2 border-fg bg-surface p-6">
          <p className="flex items-center gap-2 font-mono text-sm text-fg">
            <span className={`size-2.5 ${site.availability.open ? "bg-accent-strong" : "bg-subtle"}`} aria-hidden />
            {site.availability.open ? "Open to work" : "Not taking new work"}
          </p>
          <p className="mt-2 text-muted">{site.availability.label}</p>
          {socialLinks().length > 0 && (
            <>
              <p className="mt-6 font-mono text-xs uppercase tracking-widest text-subtle">Hoặc tìm mình ở</p>
              <ul className="mt-2 space-y-1 font-mono text-sm">
                {socialLinks().map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer me" className="text-accent underline-offset-4 hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
