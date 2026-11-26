import Link from "next/link";
import type { NavLink, Site } from "@/lib/types";
import { NavLinks } from "./nav-links";
import { Container, LogoMark } from "./ui";

export function SiteHeader({ site, navigation }: { site: Site; navigation: NavLink[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line print:hidden">
      {/* The blur sits on its own layer: backdrop-filter on <header> itself would trap the
          fixed-position mobile menu inside the 64px-tall header. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-canvas/80 backdrop-blur-md" />
      <Container className="flex h-16 items-center justify-between gap-6">
        {/* The link's name is its visible text plus "home", so speech users can say what they see. */}
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="size-8" />
          <span className="text-[1.05rem] font-semibold tracking-[-0.02em] whitespace-nowrap">{site.name}</span>
          {site.headerLabel && (
            <span className="hidden font-mono text-[0.68rem] tracking-[0.14em] text-subtle uppercase xl:inline">
              {site.headerLabel}
            </span>
          )}
          <span className="sr-only">, home</span>
        </Link>
        <NavLinks
          links={navigation}
          whatsappNumber={site.whatsappNumber}
          whatsappDisplay={site.whatsappDisplay}
          hours={site.hours}
        />
      </Container>
    </header>
  );
}
