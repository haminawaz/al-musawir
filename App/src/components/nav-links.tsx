"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/format";
import type { NavLink } from "@/lib/types";
import { buttonClass, WhatsAppIcon } from "./ui";

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop nav, the WhatsApp button, and the full-screen menu on phones and tablets. */
export function NavLinks({
  links,
  whatsappNumber,
  whatsappDisplay,
  hours,
}: {
  links: NavLink[];
  whatsappNumber: string;
  whatsappDisplay: string;
  hours: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="hidden h-full items-stretch lg:flex">
        {links.map(({ href, label }) => {
          const current = isCurrent(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={`relative flex items-center px-3.5 text-[0.92rem] transition-colors after:absolute after:inset-x-3.5 after:-bottom-px after:h-px after:transition-colors ${
                current ? "text-fg after:bg-accent" : "text-muted after:bg-transparent hover:text-fg"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <a href={whatsappLink(whatsappNumber)} className={buttonClass("primary", "sm")}>
          <WhatsAppIcon />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="relative grid size-10 cursor-pointer place-items-center rounded-lg border border-line-strong transition hover:bg-raised active:scale-95 lg:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span
            aria-hidden="true"
            className={`absolute h-px w-4.5 bg-fg transition duration-300 ${open ? "rotate-45" : "-translate-y-1"}`}
          />
          <span
            aria-hidden="true"
            className={`absolute h-px w-4.5 bg-fg transition duration-300 ${open ? "-rotate-45" : "translate-y-1"}`}
          />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-canvas lg:hidden">
          <nav aria-label="Main" className="flex flex-col px-5 pt-6 sm:px-8">
            {links.map(({ href, label }, i) => {
              const current = isCurrent(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={current ? "page" : undefined}
                  style={{ "--draw-delay": `${i * 45}ms` } as React.CSSProperties}
                  className="flex items-baseline gap-4 border-b border-line py-4 motion-safe:fade-up"
                >
                  <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`text-3xl font-semibold tracking-[-0.03em] ${current ? "text-accent" : "text-fg"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="px-5 py-8 font-mono text-sm text-muted sm:px-8">
            <p>WhatsApp {whatsappDisplay}</p>
            <p>{hours}</p>
          </div>
        </div>
      )}
    </>
  );
}
