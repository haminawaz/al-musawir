"use client";

import { TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";

type ConfirmOptions = {
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Solid red confirm button, for actions that lose or delete something. */
  danger?: boolean;
  /** Colour of the icon: amber for a warning, red for a deletion. Defaults to red when `danger`. */
  tone?: "warning" | "danger";
};
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/** `if (await confirm({ title: "Delete?" })) ...` */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>.");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) =>
        setPending((current) => {
          current?.resolve(false); // a second request replaces an open one
          return { ...options, resolve };
        }),
      ),
    [],
  );

  useEffect(() => {
    if (pending && !dialog.current?.open) dialog.current?.showModal();
  }, [pending]);

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
    dialog.current?.close();
  };

  const tone = pending?.tone ?? (pending?.danger ? "danger" : "warning");

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialog}
        onCancel={(e) => {
          // Esc means "no".
          e.preventDefault();
          close(false);
        }}
        onClick={(e) => e.target === dialog.current && close(false)}
        aria-labelledby="confirm-title"
        aria-describedby={pending?.body ? "confirm-body" : undefined}
        className="m-auto w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line-strong bg-surface p-0 text-fg shadow-[0_40px_120px_-20px_rgba(0,0,0,1)] open:motion-safe:animate-[dialog-in_0.22s_cubic-bezier(0.22,1,0.36,1)]"
      >
        {pending && (
          <>
            <div className="flex gap-4 p-6">
              <span
                aria-hidden="true"
                className={`grid size-11 shrink-0 place-items-center rounded-full ring-1 ${
                  tone === "danger" ? "bg-danger/10 text-danger ring-danger/30" : "bg-accent/10 text-accent ring-accent/30"
                }`}
              >
                <TriangleAlert className="size-5" />
              </span>
              <div className="pt-1">
                <h2 id="confirm-title" className="text-[1.15rem] leading-snug font-semibold tracking-[-0.02em]">
                  {pending.title}
                </h2>
                {pending.body && (
                  <div id="confirm-body" className="mt-2 text-[0.92rem] leading-relaxed text-muted">
                    {pending.body}
                  </div>
                )}
              </div>
            </div>
            {/* The safe choice comes first, so it is the one focused when the dialog opens. */}
            <div className="flex flex-col-reverse gap-2 border-t border-line bg-canvas/50 px-6 py-4 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => close(false)}>
                {pending.cancelLabel ?? "Cancel"}
              </Button>
              <Button variant={pending.danger ? "destructive" : "primary"} onClick={() => close(true)}>
                {pending.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
