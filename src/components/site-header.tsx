import Link from "next/link";
import { site } from "@/data/site";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-5 border-b border-line bg-paper print:hidden">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="font-serif text-[1.4rem] leading-[normal] font-semibold">
          {site.name}
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
