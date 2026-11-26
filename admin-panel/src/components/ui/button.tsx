import type { ComponentProps } from "react";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent-strong",
  secondary: "border border-line-strong text-fg hover:border-subtle hover:bg-raised",
  ghost: "text-muted hover:bg-raised hover:text-fg",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
  /** Solid red, for the confirm button in a dialog. */
  destructive: "bg-danger text-[#240c08] hover:bg-[#f5a093]",
};

const sizes = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-[0.8rem]",
  icon: "size-8 text-sm",
};

export type ButtonVariant = keyof typeof variants;

/** Classes for anything that looks like a button: <Link>, <a> or <button>. */
export function buttonClass(variant: ButtonVariant = "primary", size: keyof typeof sizes = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: keyof typeof sizes }) {
  return <button type={type} {...props} className={`${buttonClass(variant, size)} ${className}`} />;
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
