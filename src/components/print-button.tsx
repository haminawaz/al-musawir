"use client";

import { buttonClass } from "./ui";

export function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("secondary")}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
        <path d="M4 6V2h8v4M4 12H2.5V6.5h11V12H12M4 9.5h8V14H4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      {children}
    </button>
  );
}
