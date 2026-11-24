import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Accent, buttonClass, Container, WhatsAppIcon } from "@/components/ui";
import { site, whatsappLink } from "@/data/site";

export const metadata: Metadata = { title: "Contact" };

const delay = (s: number) => ({ "--draw-delay": `${s}s` }) as React.CSSProperties;

export default function ContactPage() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-dots mask-[radial-gradient(ellipse_60%_80%_at_10%_0%,black,transparent)]"
      />
      <Container className="grid gap-14 py-16 sm:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow motion-safe:fade-up">Contact</p>
          <h1 className="mt-6 max-w-[12ch] text-title motion-safe:fade-up" style={delay(0.08)}>
            Get your plot <Accent>drawn.</Accent>
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg text-muted motion-safe:fade-up" style={delay(0.16)}>
            Send your plot size and city. We reply the same day.
          </p>
          <a href={whatsappLink()} className={`${buttonClass()} mt-10 motion-safe:fade-up`} style={delay(0.24)}>
            <WhatsAppIcon className="size-5" />
            Message on WhatsApp
          </a>
          <dl className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line motion-safe:fade-up" style={delay(0.32)}>
            {[
              ["WhatsApp", site.whatsappDisplay],
              ["Hours", site.hours],
              ["Reply", "Same day"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 bg-canvas px-5 py-4">
                <dt className="font-mono text-[0.72rem] tracking-[0.12em] text-subtle uppercase">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="motion-safe:fade-up lg:col-span-6 lg:col-start-7" style={delay(0.2)}>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
