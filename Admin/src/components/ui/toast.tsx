"use client";

import { CircleAlert, CircleCheck, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { buttonClass } from "./button";

type ToastAction = {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  autoFocus?: boolean;
};

type ToastOptions = {
  tone: "success" | "error" | "warning";
  message: string;
  detail?: string;
  /** Buttons under the message. Any of them also closes the toast. */
  actions?: ToastAction[];
  /** A new toast with the same key replaces the old one instead of stacking. */
  key?: string;
  duration?: number;
};

type Toast = ToastOptions & { id: number };
type ToastApi = {
  show: (options: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}

let nextId = 1;

const icons = {
  success: <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />,
  error: <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />,
  warning: <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (options: ToastOptions) => {
      const id = nextId++;
      setToasts((all) => [...all.filter((t) => !options.key || t.key !== options.key).slice(-2), { ...options, id }]);
      setTimeout(() => dismiss(id), options.duration ?? (options.tone === "success" ? 3500 : 7000));
    },
    [dismiss],
  );
  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message) => show({ tone: "success", message }),
      error: (message) => show({ tone: "error", message }),
    }),
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
            role={t.tone === "success" ? "status" : "alert"}
            className={`pointer-events-auto rounded-xl border bg-raised px-4 py-3 text-sm shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] motion-safe:fade-up ${
              t.tone === "warning" ? "border-accent/50" : "border-line-strong"
            }`}
          >
            <div className="flex items-start gap-3">
              {icons[t.tone]}
              <div className="flex-1">
                <p className={t.detail ? "font-medium" : ""}>{t.message}</p>
                {t.detail && <p className="mt-0.5 text-muted">{t.detail}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-1 cursor-pointer rounded p-1 text-subtle transition hover:text-fg"
              >
                <X className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Dismiss</span>
              </button>
            </div>
            {t.actions && (
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {t.actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    autoFocus={a.autoFocus}
                    onClick={() => {
                      dismiss(t.id);
                      a.onClick?.();
                    }}
                    className={buttonClass(a.variant ?? "secondary", "sm")}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
