import type { ComponentProps, ReactNode } from "react";

const buttonBase =
  "inline-block cursor-pointer rounded-md border px-5 py-2.75 font-sans text-[1rem] leading-[normal] font-semibold print:hidden";

const buttonVariants = {
  primary: "border-accent bg-accent text-on-accent",
  outline: "border-ink bg-transparent text-ink",
};

/** Classes for anything that looks like a button: <Link>, <a> or <button>. */
export function buttonClass(variant: keyof typeof buttonVariants = "primary") {
  return `${buttonBase} ${buttonVariants[variant]}`;
}

/** Top-level page block: the first block on every page. */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className="pt-13 pb-18">{children}</div>;
}

/** A full-width block with a rule above it. */
export function Band({ children }: { children: ReactNode }) {
  return <section className="border-t border-line py-13">{children}</section>;
}

/** Two columns on wide screens, one column at 800px and below. */
export function Split({ children, align = "center" }: { children: ReactNode; align?: "center" | "start" }) {
  return (
    <div
      className={`grid gap-12 min-[801px]:grid-cols-[1fr_1.1fr] ${align === "start" ? "items-start" : "items-center"}`}
    >
      {children}
    </div>
  );
}

const cell = "border-b border-line px-3.5 py-2.5 text-start align-top text-[.97rem]";

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full border-collapse bg-panel">{children}</table>;
}

export function Th(props: ComponentProps<"th">) {
  return <th {...props} className={`${cell} w-[38%] bg-wash font-semibold`} />;
}

export function Td(props: ComponentProps<"td">) {
  return <td {...props} className={cell} />;
}

/** A table of label / value rows. */
export function KeyValueTable({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <Table>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <Th scope="row">{label}</Th>
            <Td>{value}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
