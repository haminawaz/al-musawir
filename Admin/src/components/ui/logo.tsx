/** The website's brand mark: a plot boundary with two walls. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="14" className="fill-surface stroke-line-strong" strokeWidth="2" />
      <rect x="15" y="12" width="34" height="40" fill="none" className="stroke-accent" strokeWidth="4" />
      <path d="M15 30H35V52M35 30V12" fill="none" className="stroke-accent" strokeWidth="2.5" />
    </svg>
  );
}
