"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import AnimatedContent from "./react-bits/AnimatedContent";

/** True when the media query matches. Always false during server rendering. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Fades its content up as it scrolls into view. Use below the fold only: the content stays hidden until JS runs.
 * `stagger` animates each direct child in turn.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <AnimatedContent
      distance={32}
      duration={0.9}
      ease="power3.out"
      blur={4}
      threshold={0.12}
      delay={delay}
      stagger={stagger}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
