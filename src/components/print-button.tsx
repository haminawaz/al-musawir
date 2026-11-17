"use client";

import { buttonClass } from "./ui";

export function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("outline")}>
      {children}
    </button>
  );
}
