"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/lib/format";
import type { NavLink } from "@/lib/types";
import { useMediaQuery } from "./motion";
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
  const [menuOpen, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // The menu only exists below the desktop breakpoint: widening the window (e.g. rotating a tablet)
  // closes it, so the page is never left locked behind a menu that CSS has hidden.
  const desktop = useMediaQuery("(min-width: 1024px)");
  const open = menuOpen && !desktop;

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    // The menu covers the page: keep keyboard and screen-reader focus out of what is behind it.
    const behind = [document.getElementById("main"), document.querySelector("body > footer")].filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    behind.forEach((el) => (el.inert = true));
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
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
          {/* Icon only on the narrowest phones, so the header fits on one line at 320px. */}
          <span className="max-[359px]:sr-only">WhatsApp</span>
        </a>
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen(!open)}
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
            <p>
              <a href={whatsappLink(whatsappNumber)} className="underline-offset-4 transition hover:text-fg hover:underline">
                WhatsApp {whatsappDisplay}
              </a>
            </p>
            <p>{hours}</p>
          </div>
        </div>
      )}
    </>
  );
}
