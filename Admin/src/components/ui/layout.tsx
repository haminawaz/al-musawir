"use client";

import { CircleAlert, RotateCcw, Save, TriangleAlert } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { UNSAVED_NUDGE_EVENT } from "@/lib/unsaved";
import { Button, Spinner } from "./button";

/** Title row at the top of each dashboard page. */
export function PageTitle({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-8">
      <div>
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.03em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-[68ch] text-[0.92rem] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "p-5 sm:p-6",
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="text-[0.98rem] font-semibold tracking-[-0.01em]">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.82rem] text-muted">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/**
 * Sticky bar that appears while there are unsaved changes. Ctrl/Cmd+S saves.
 */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
}) {
  const [nudged, setNudged] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, onSave]);

  // Flash when someone tries to leave with unsaved changes, to point at Save.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onNudge = () => {
      setNudged(true);
      clearTimeout(timer);
      timer = setTimeout(() => setNudged(false), 1200);
    };
    window.addEventListener(UNSAVED_NUDGE_EVENT, onNudge);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(UNSAVED_NUDGE_EVENT, onNudge);
    };
  }, []);

  if (!dirty && !saving) return null;
  return (
    <div className="sticky bottom-4 z-20 mt-8 motion-safe:fade-up">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-raised/95 px-4 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.95)] backdrop-blur transition-[border-color,box-shadow] duration-300 ${
          nudged ? "border-accent ring-2 ring-accent/60 motion-safe:animate-[nudge_0.45s_ease-in-out]" : "border-accent/40"
        }`}
      >
        <p className="flex items-center gap-2 text-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Unsaved changes
          <kbd className="ml-2 hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[0.68rem] text-subtle sm:inline">
            Ctrl S
          </kbd>
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Discard
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? <Spinner className="size-3.5" /> : <Save className="size-3.5" aria-hidden="true" />}
            {saving ? "Saving…" : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Problems the server (or the form) found, listed above the form. */
export function ErrorSummary({ errors, title = "Fix these before saving" }: { errors: string[]; title?: string }) {
  if (!errors.length) return null;
  return (
    <div role="alert" className="mb-6 rounded-xl border border-danger/40 bg-danger/5 px-5 py-4">
      <p className="flex items-center gap-2 text-sm font-medium text-danger">
        <CircleAlert className="size-4" aria-hidden="true" />
        {title}
      </p>
      <ul className="mt-2 grid gap-1 pl-6 text-sm text-fg/90">
        {errors.map((e) => (
          <li key={e} className="list-disc">
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-1.5">
      {items.map((w) => (
        <li key={w} className="flex gap-2 text-[0.82rem] text-accent">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {w}
        </li>
      ))}
    </ul>
  );
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-28" style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="grid justify-items-start gap-4 rounded-2xl border border-line bg-surface p-8">
      <div>
        <p className="font-medium">Could not load this page</p>
        <p className="mt-1 text-sm text-muted">{message}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {text && <p className="max-w-[44ch] text-sm text-muted">{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** A heading the way the website draws it: plain words, then the accent in amber italic serif. */
export function HeadingPreview({ title, accent }: { title: string; accent: string }) {
  return (
    <p className="text-[1.35rem] leading-tight font-semibold tracking-[-0.03em]">
      {title || <span className="text-subtle">Heading</span>}{" "}
      <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">{accent}</span>
    </p>
  );
}
