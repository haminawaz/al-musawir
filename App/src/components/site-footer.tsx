import Link from "next/link";
import { whatsappLink } from "@/lib/format";
import type { NavLink, PageTexts, Site } from "@/lib/types";
import Magnet from "./react-bits/Magnet";
import { Accent, buttonClass, Container, WhatsAppIcon } from "./ui";

/** Site-wide closing call to action plus contact details. */
export function SiteFooter({ site, navigation, text }: { site: Site; navigation: NavLink[]; text: PageTexts["footer"]["cta"] }) {
  const whatsapp = whatsappLink(site.whatsappNumber);
  return (
    <footer className="relative isolate overflow-hidden border-t border-line print:hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots mask-[linear-gradient(to_bottom,black,transparent_70%)]" />
      <Container className="pt-20 pb-10 sm:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow">{text.eyebrow}</p>
            <p className="mt-5 max-w-[16ch] text-heading">
              {text.title} {text.titleAccent && <Accent>{text.titleAccent}</Accent>}
            </p>
            <Magnet padding={60} magnetStrength={3} wrapperClassName="mt-10">
              <a href={whatsapp} className={buttonClass()}>
                <WhatsAppIcon className="size-5" />
                {text.buttonLabel}
              </a>
            </Magnet>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-5 md:pt-11">
            <div>
              <p className="eyebrow">Contact</p>
              <ul className="mt-4 space-y-2 text-[0.95rem] text-muted">
                <li>
                  <a href={whatsapp} className="transition hover:text-fg">
                    WhatsApp {site.whatsappDisplay}
                  </a>
                </li>
                <li>{site.hours}</li>
              </ul>
            </div>
            <div>
              <p className="eyebrow">Pages</p>
              <ul className="mt-4 space-y-2 text-[0.95rem]">
                {navigation.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-muted transition hover:text-fg">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-20 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-line pt-6 font-mono text-xs text-subtle">
          <span>
            © {new Date().getFullYear()} {site.name} · {site.tagline}
          </span>
          <span>{text.bottomLine}</span>
        </div>
      </Container>
    </footer>
  );
}
