"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId } from "react";
import { useToast } from "@/components/ui/toast";

// Tracks editors with unsaved changes. Leaving one through a link inside the dashboard shows
// an in-app toast; closing or reloading the tab shows the browser's own prompt, the only one
// browsers allow there.

const dirtyEditors = new Set<string>();

/** Fired when someone tries to leave with unsaved changes; the save bar flashes. */
export const UNSAVED_NUDGE_EVENT = "unsaved-changes:nudge";

export function hasUnsavedChanges() {
  return dirtyEditors.size > 0;
}

export function useUnsavedChanges(dirty: boolean) {
  const id = useId();
  useEffect(() => {
    if (!dirty) return;
    dirtyEditors.add(id);
    const warn = (e: BeforeUnloadEvent) => {
      if (dirtyEditors.has(id)) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      dirtyEditors.delete(id);
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, id]);
}

/**
 * Returns `askToLeave(leave)`: runs `leave` straight away when nothing is unsaved,
 * otherwise asks in a toast first.
 */
export function useLeaveGuard() {
  const toast = useToast();
  return useCallback(
    (leave: () => void) => {
      if (!hasUnsavedChanges()) return leave();
      window.dispatchEvent(new Event(UNSAVED_NUDGE_EVENT));
      toast.show({
        key: "unsaved-changes",
        tone: "warning",
        message: "You have unsaved changes.",
        detail: "Save them first, or leave this page and lose them.",
        duration: 10000,
        actions: [
          {
            label: "Leave without saving",
            variant: "danger",
            onClick: () => {
              // The person chose to go: let this navigation through, including the browser's unload check.
              dirtyEditors.clear();
              leave();
            },
          },
          { label: "Stay", autoFocus: true },
        ],
      });
    },
    [toast],
  );
}

/**
 * Catches clicks on any link inside the dashboard while there are unsaved changes,
 * and asks in a toast instead of navigating. Mounted once, in the shell.
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
