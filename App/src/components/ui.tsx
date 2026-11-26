import type { ComponentProps, ReactNode } from "react";

/** Page-width wrapper: 1240px max, 20px gutters on phones, 32px from 640px up. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-310 px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** Section header: numbered label on the left, heading and intro on the right. */
export function SectionHeader({
  index,
  label,
  title,
  intro,
  action,
}: {
  index: string;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-6 border-t border-line pt-6 md:grid-cols-12 md:gap-8">
      <p className="eyebrow md:col-span-3">
        <span className="text-accent">{index}</span> / {label}
      </p>
      <div className="flex flex-col gap-6 md:col-span-9 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="max-w-[20ch] text-heading">{title}</h2>
          {intro && <p className="mt-5 max-w-[58ch] text-muted">{intro}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/** Top of an inner page: label, large title and intro over a fading CAD grid. */
export function PageHeader({
  label,
  title,
  intro,
  children,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  const delay = (s: number) => ({ "--draw-delay": `${s}s` }) as React.CSSProperties;
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-dots mask-[radial-gradient(ellipse_70%_100%_at_15%_0%,black,transparent)]"
      />
      <Container className="pt-16 pb-14 sm:pt-24 sm:pb-20">
        <p className="eyebrow motion-safe:fade-up">{label}</p>
        <h1 className="mt-6 max-w-[17ch] text-title motion-safe:fade-up" style={delay(0.08)}>
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-[56ch] text-lg text-muted motion-safe:fade-up" style={delay(0.16)}>
            {intro}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}

/** One accent word in a heading: italic serif in amber. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-serif font-normal tracking-[-0.02em] text-accent italic">{children}</span>;
}

/** A heading from page text: the title, then its accent words. */
export function AccentTitle({ text }: { text: { title: string; titleAccent: string } }) {
  return (
    <>
      {text.title} {text.titleAccent && <Accent>{text.titleAccent}</Accent>}
    </>
  );
}

const buttonBase =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition duration-200 active:scale-[0.98] print:hidden";

const buttonVariants = {
  primary:
    "bg-accent text-on-accent shadow-[0_10px_30px_-12px_rgba(229,174,75,0.55)] hover:bg-accent-strong",
  secondary: "border border-line-strong text-fg hover:border-subtle hover:bg-raised",
};

const buttonSizes = {
  md: "px-5 py-3 text-[0.95rem]",
  sm: "px-3.5 py-2 text-sm",
};

/** Classes for anything that looks like a button: <Link>, <a> or <button>. */
export function buttonClass(variant: keyof typeof buttonVariants = "primary", size: keyof typeof buttonSizes = "md") {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]}`;
}

/** Underlined text link with a moving arrow. */
export const textLinkClass =
  "group inline-flex items-center gap-2 font-medium text-fg underline decoration-line-strong underline-offset-[6px] transition hover:decoration-accent";

export function ArrowIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4.1 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
    </svg>
  );
}

/** Brand mark: a plot boundary with two walls. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="14" className="fill-surface stroke-line-strong" strokeWidth="2" />
      <rect x="15" y="12" width="34" height="40" fill="none" className="stroke-accent" strokeWidth="4" />
      <path d="M15 30H35V52M35 30V12" fill="none" className="stroke-accent" strokeWidth="2.5" />
    </svg>
  );
}

const cell = "border-b border-line py-3 align-top";

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <table className={`w-full border-collapse text-[0.95rem] tabular-nums ${className}`}>{children}</table>;
}

/** Column header or row label: small mono caps, like a CAD title block. */
export function Th(props: ComponentProps<"th">) {
  return (
    <th
      {...props}
      className={`${cell} pr-4 text-left font-mono text-[0.72rem] font-normal tracking-widest text-subtle uppercase ${
        props.className ?? ""
      }`}
    />
  );
}

export function Td(props: ComponentProps<"td">) {
  return <td {...props} className={`${cell} pr-4 last:pr-0 ${props.className ?? ""}`} />;
}

/** A table of label / value rows. */
export function KeyValueTable({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <Table>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <Th scope="row" className="w-[42%] pt-3.5">
              {label}
            </Th>
            <Td>{value}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
