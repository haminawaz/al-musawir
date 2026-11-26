"use client";

import {
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Map as MapIcon,
  Menu,
  PenTool,
  Settings,
  Tags,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo";
import { api, endpoints, isMockApi, siteUrl, type EndpointTypes } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { LeaveGuard, useLeaveGuard } from "@/lib/unsaved";

const groups = [
  { items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }] },
  {
    label: "Content",
    items: [
      { href: "/projects", label: "Projects", icon: FolderOpen },
      { href: "/categories", label: "Categories", icon: Tags },
      { href: "/services", label: "Services", icon: PenTool },
      { href: "/process", label: "Process", icon: ListOrdered },
      { href: "/survey", label: "Land survey", icon: MapIcon },
      { href: "/page-text", label: "Page text", icon: FileText },
    ],
  },
  { items: [{ href: "/settings", label: "Settings", icon: Settings }] },
];

const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the phone menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_1fr]">
      <a
        href="#main"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <LeaveGuard />

      {/* Phone and tablet bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="sidebar"
          className="grid size-9 cursor-pointer place-items-center rounded-lg border border-line-strong transition hover:bg-raised"
        >
          {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>
      {open && <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:w-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-5">
          <Brand />
          {isMockApi && (
            <span
              title="Changes are saved by the mock API in this app, not by the real backend."
              className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-[0.62rem] tracking-wider text-accent uppercase"
            >
              Mock
            </span>
          )}
        </div>
        <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group, gi) => (
            <div key={gi} className={gi ? "mt-5" : ""}>
              {group.label && <p className="eyebrow mb-1.5 px-3">{group.label}</p>}
              <ul className="grid gap-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const current = isCurrent(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={current ? "page" : undefined}
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] transition ${
                          current ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg"
                        }`}
                      >
                        {current && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
                        <Icon className={`size-4 ${current ? "text-accent" : ""}`} aria-hidden="true" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] text-muted transition hover:bg-raised/60 hover:text-fg"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View website
          </a>
          <UserMenu />
        </div>
      </aside>

      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <LogoMark className="size-7" />
      <span className="leading-tight">
        <span className="block text-[0.95rem] font-semibold tracking-[-0.02em]">Al-Musawir</span>
        <span className="block font-mono text-[0.6rem] tracking-[0.14em] text-subtle uppercase">Admin</span>
      </span>
    </Link>
  );
}

function UserMenu() {
  const { data } = useResource<EndpointTypes["me"]>(endpoints.me);
  const [signingOut, setSigningOut] = useState(false);
  const askToLeave = useLeaveGuard();

  function signOut() {
    askToLeave(async () => {
      setSigningOut(true);
      await api.post(endpoints.logout).catch(() => undefined);
      window.location.assign("/login");
    });
  }

  return (
    <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-xs font-medium text-accent uppercase"
      >
        {data?.user.name.slice(0, 2) ?? ""}
      </span>
      <div className="min-w-0 flex-1">
        {data ? (
          <>
            <p className="truncate text-sm font-medium">{data.user.name}</p>
            <p className="truncate text-[0.72rem] text-subtle">{data.user.email}</p>
          </>
        ) : (
          <div className="grid gap-1.5">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-2.5 w-28" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={signOut}
        disabled={signingOut}
        title="Sign out"
        className="grid size-8 cursor-pointer place-items-center rounded-md text-subtle transition hover:bg-raised hover:text-fg disabled:opacity-50"
      >
        <LogOut className="size-4" aria-hidden="true" />
        <span className="sr-only">Sign out</span>
      </button>
    </div>
  );
}
