import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { AccentTitle, buttonClass, Container, WhatsAppIcon } from "@/components/ui";
import { getPage, getSite } from "@/lib/content";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = { title: "Contact" };

const delay = (s: number) => ({ "--draw-delay": `${s}s` }) as React.CSSProperties;

export default async function ContactPage() {
  const [text, { site }] = await Promise.all([getPage("contact"), getSite()]);
  const details = [
    ["WhatsApp", site.whatsappDisplay],
    ["Hours", site.hours],
    ["Reply", text.header.replyTime],
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-dots mask-[radial-gradient(ellipse_60%_80%_at_10%_0%,black,transparent)]"
      />
      <Container className="grid gap-14 py-16 sm:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow motion-safe:fade-up">{text.header.label}</p>
          <h1 className="mt-6 max-w-[12ch] text-title motion-safe:fade-up" style={delay(0.08)}>
            <AccentTitle text={text.header} />
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg text-muted motion-safe:fade-up" style={delay(0.16)}>
            {text.header.intro}
          </p>
          <a href={whatsappLink(site.whatsappNumber)} className={`${buttonClass()} mt-10 motion-safe:fade-up`} style={delay(0.24)}>
            <WhatsAppIcon className="size-5" />
            {text.header.buttonLabel}
          </a>
          <dl className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line motion-safe:fade-up" style={delay(0.32)}>
            {details.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 bg-canvas px-5 py-4">
                <dt className="font-mono text-[0.72rem] tracking-[0.12em] text-subtle uppercase">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="motion-safe:fade-up lg:col-span-6 lg:col-start-7" style={delay(0.2)}>
          <ContactForm whatsappNumber={site.whatsappNumber} text={text.form} />
        </div>
      </Container>
    </section>
  );
}
