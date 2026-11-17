import type { ReactNode } from "react";

/** Bordered drafting-paper panel that holds a plan drawing. "tile" is the smaller version used in project grids. */
export function PlanFrame({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "tile" }) {
  return (
    <div
      className={`border border-line bg-graph ${
        variant === "tile" ? "p-1.5 [--graph-size:20px] group-hover:border-ink" : "p-2.5"
      }`}
    >
      {children}
    </div>
  );
}
