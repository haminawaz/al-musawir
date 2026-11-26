"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId } from "react";
import { useConfirm } from "@/components/ui/confirm";

// Tracks editors with unsaved changes. Leaving one through a link inside the dashboard opens
// a dialog; closing or reloading the tab shows the browser's own prompt, the only one
// browsers allow there.

/** Editor id -> what it edits, e.g. "Land survey details". */
const dirtyEditors = new Map<string, string>();

/** Fired when someone chooses to stay with unsaved changes; the save bar flashes. */
export const UNSAVED_NUDGE_EVENT = "unsaved-changes:nudge";

export function hasUnsavedChanges() {
  return dirtyEditors.size > 0;
}

/** "Services", "Site settings and Navigation". */
function describeUnsaved() {
  const labels = [...new Set(dirtyEditors.values())];
  return labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}` : labels[0];
}

export function useUnsavedChanges(dirty: boolean, label: string) {
  const id = useId();
  useEffect(() => {
    if (!dirty) return;
    dirtyEditors.set(id, label);
    const warn = (e: BeforeUnloadEvent) => {
      if (dirtyEditors.has(id)) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      dirtyEditors.delete(id);
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, id, label]);
}

/**
 * Returns `askToLeave(leave)`: runs `leave` straight away when nothing is unsaved,
 * otherwise asks in a dialog first.
 */
export function useLeaveGuard() {
  const confirm = useConfirm();
  return useCallback(
    async (leave: () => void) => {
      if (!hasUnsavedChanges()) return leave();
      const ok = await confirm({
        title: "Leave without saving?",
        body: `Your changes to ${describeUnsaved()} have not been saved. If you leave this page, they will be lost.`,
        cancelLabel: "Stay on this page",
        confirmLabel: "Leave without saving",
        danger: true,
        tone: "warning",
      });
      if (ok) {
        // The person chose to go: let this navigation through, including the browser's unload check.
        dirtyEditors.clear();
        leave();
      } else {
        window.dispatchEvent(new Event(UNSAVED_NUDGE_EVENT));
      }
    },
    [confirm],
  );
}

/**
 * Catches clicks on any link inside the dashboard while there are unsaved changes,
 * and asks in a dialog instead of navigating. Mounted once, in the shell.
 */
export function LeaveGuard() {
  const router = useRouter();
  const askToLeave = useLeaveGuard();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges() || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      // Capture phase on the document runs before React, so the link never navigates.
      e.preventDefault();
      e.stopPropagation();
      askToLeave(() => router.push(url.pathname + url.search + url.hash));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, askToLeave]);

  return null;
}
