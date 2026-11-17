"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-wrap gap-1.5">
      {navLinks.map(({ href, label }) => {
        const current = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[.95rem] font-medium ${
              current ? "bg-accent text-on-accent" : "hover:bg-tint"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
