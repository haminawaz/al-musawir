import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { ServiceArt } from "@/components/plan/service-art";
import { AccentTitle, buttonClass, Container, PageHeader, WhatsAppIcon } from "@/components/ui";
import { getPage, getServices, getSite } from "@/lib/content";
import { describe, pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const [text, { site }] = await Promise.all([getPage("services"), getSite()]);
  return pageMetadata({ site, title: text.header.label, description: describe(text.header.intro), path: "/services" });
}

export default async function ServicesPage() {
  const [text, services, { site }] = await Promise.all([getPage("services"), getServices(), getSite()]);

  return (
    <>
      <PageHeader label={text.header.label} title={<AccentTitle text={text.header} />} intro={text.header.intro} />
      <Container className="py-10 sm:py-16">
        {services.map((s, i) => (
          <Reveal key={s.id} className="grid items-center gap-10 border-b border-line py-14 last:border-b-0 md:grid-cols-12 md:gap-12 md:py-20">
            <div className={`md:col-span-6 ${i % 2 ? "md:order-2 md:col-start-7" : ""}`}>
              <div className="group rounded-2xl border border-line bg-surface bg-dots px-8 py-12 [--dots:20px]">
                <ServiceArt id={s.id} className="mx-auto h-auto w-full max-w-95" />
              </div>
            </div>
            <div className={`md:col-span-5 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
              <p className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-4 text-heading">{s.name}</h2>
              <p className="mt-5 text-lg text-muted">{s.summary}</p>
              <div className="mt-8 border-t border-line pt-5">
                <p className="eyebrow">You receive</p>
                <p className="mt-2">{s.deliverables}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </Container>
      <Container className="pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-subheading">{text.cta.title}</p>
            <p className="mt-1 text-muted">{text.cta.text}</p>
          </div>
          <a href={whatsappLink(site.whatsappNumber, text.cta.whatsappMessage)} className={buttonClass()}>
            <WhatsAppIcon className="size-5" />
            {text.cta.buttonLabel}
          </a>
        </div>
      </Container>
    </>
  );
}
