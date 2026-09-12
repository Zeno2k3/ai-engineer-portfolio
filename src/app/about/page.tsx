import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { CredentialCard, ViewAll } from "@/components/content-sections";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { getCredentials, getProfile, getRoadmap } from "@/lib/content";
import { absoluteUrl, personLd } from "@/lib/jsonld";
import { socialLinks } from "@/lib/site";
import { buttonPrimary, buttonSecondary, containerClass, eyebrowClass } from "@/lib/ui";

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: "Giới thiệu",
    description: `Về ${profile.name}: đang học gì, đã làm gì và cách liên hệ.`,
    alternates: { canonical: "/about" },
  };
}

export default function AboutPage() {
  const profile = getProfile();
  const roadmap = getRoadmap();
  const credentials = getCredentials();
  const socials = socialLinks(profile.socials);
  const shown = [...credentials.filter((c) => c.featured), ...credentials.filter((c) => !c.featured)].slice(0, 4);

  return (
    <div className={`${containerClass} py-16 sm:py-20`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl("/about"),
          inLanguage: "vi",
          mainEntity: personLd(),
        }}
      />

      <header className="grid gap-10 border-b-2 border-fg pb-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className={eyebrowClass}>About</p>
          <h1 className="mt-3 text-5xl leading-tight font-semibold tracking-tight text-fg sm:text-6xl">{profile.name}</h1>
          <p className="mt-2 font-mono text-sm text-muted">{profile.role}</p>
          <div className="mt-6 max-w-[65ch] space-y-4 text-xl leading-relaxed text-fg-soft">
            {profile.about.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <aside className="self-start border-2 border-fg bg-surface p-6">
          <p className="flex items-center gap-2 font-mono text-sm text-fg">
            <span className={`size-2.5 ${profile.availability.open ? "bg-accent-strong" : "bg-subtle"}`} aria-hidden />
            {profile.availability.open ? "Open to work" : "Not available"}
          </p>
          <p className="mt-2 text-muted">{profile.availability.label}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/contact" className={buttonPrimary}>
              Liên hệ <ArrowRight className="size-4" aria-hidden />
            </Link>
            {profile.cvUrl && (
              <a href={profile.cvUrl} className={buttonSecondary} download>
                <Download className="size-4" aria-hidden /> Tải CV (PDF)
              </a>
            )}
          </div>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-4 font-mono text-sm">
              {socials.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer me" className="text-accent underline-offset-4 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </header>

      <section aria-labelledby="hanh-trinh" className="py-16">
        <SectionHeading label="Timeline" title="Hành trình" id="hanh-trinh" />
        <ol className="max-w-3xl space-y-8 border-l-2 border-fg pl-6">
          {profile.about.timeline.map((item) => (
            <li key={item.title} className="relative">
              <span className="absolute top-2 -left-[31px] size-3 border-2 border-fg bg-accent-strong" aria-hidden />
              <p className="font-mono text-xs text-subtle">{item.period}</p>
              <h3 className="mt-1 text-2xl font-semibold text-fg">{item.title}</h3>
              <p className="mt-2 text-lg leading-relaxed text-muted">{item.impact}</p>
            </li>
          ))}
        </ol>
      </section>

      {shown.length > 0 && (
        <section aria-labelledby="chung-chi" className="pb-8">
          <SectionHeading
            label="Certificates"
            title="Chứng chỉ & Khoá học"
            id="chung-chi"
            action={<ViewAll href="/certificates" count={credentials.length} />}
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {shown.map((item, i) => (
              <li key={`${i}-${item.title}`}>
                <CredentialCard item={item} stage={roadmap.find((s) => s.id === item.stageId)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
