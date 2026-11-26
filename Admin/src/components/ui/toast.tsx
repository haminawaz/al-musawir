"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Toast = { id: number; tone: "success" | "error"; message: string };
type ToastApi = { success: (message: string) => void; error: (message: string) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (tone: Toast["tone"], message: string) => {
      const id = nextId++;
      setToasts((all) => [...all.slice(-2), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 3500);
    },
    [dismiss],
  );
  const api = useMemo<ToastApi>(
    () => ({ success: (m) => show("success", m), error: (m) => show("error", m) }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Top right, so toasts never cover the save bar at the bottom of the page. */}
      <div aria-live="polite" className="pointer-events-none fixed top-4 right-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line-strong bg-raised px-4 py-3 text-sm shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] motion-safe:fade-up"
          >
            {t.tone === "success" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            )}
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-m-1 cursor-pointer rounded p-1 text-subtle transition hover:text-fg"
            >
              <X className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
