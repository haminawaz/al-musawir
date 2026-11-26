"use client";

import { useEffect, useId, useState, type ComponentProps, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-line-strong bg-raised px-3 py-2 text-[0.92rem] text-fg transition placeholder:text-subtle hover:border-subtle focus:border-accent focus:outline-none aria-invalid:border-danger disabled:opacity-60";

/** Compact input for table cells. */
export const cellInputClass =
  "w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm tabular-nums text-fg transition hover:border-line-strong focus:border-accent focus:bg-raised focus:outline-none aria-invalid:border-danger";

/** Label, control, help text. The control is a render function so it gets the label's id. */
export function Field({
  label,
  help,
  className = "",
  counter,
  children,
}: {
  label: ReactNode;
  help?: ReactNode;
  className?: string;
  counter?: ReactNode;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  return (
    <div className={`grid content-start gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.82rem] font-medium text-fg">
          {label}
        </label>
        {counter}
      </div>
      {children(id, help ? helpId : undefined)}
      {help && (
        <p id={helpId} className="text-[0.78rem] text-subtle">
          {help}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  help,
  value,
  onChange,
  multiline = false,
  className,
  showCount,
  ...rest
}: {
  label: ReactNode;
  help?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  /** Shows a character counter that turns amber past this length. */
  showCount?: number;
} & Omit<ComponentProps<"input">, "value" | "onChange">) {
  const counter = showCount ? (
    <span className={`font-mono text-[0.7rem] ${value.length > showCount ? "text-accent" : "text-subtle"}`}>
      {value.length}/{showCount}
    </span>
  ) : null;
  return (
    <Field label={label} help={help} className={className} counter={counter}>
      {(id, describedBy) =>
        multiline ? (
          <textarea
            id={id}
            aria-describedby={describedBy}
            value={value}
            rows={3}
            placeholder={rest.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} field-sizing-content min-h-20 resize-y leading-relaxed`}
          />
        ) : (
          <input
            id={id}
            aria-describedby={describedBy}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            {...rest}
          />
        )
      }
    </Field>
  );
}

const formatNumber = (n: number | undefined) => (n === undefined || Number.isNaN(n) ? "" : String(n));

/**
 * Number input that lets people type freely ("1.", "-", "") and reports finite numbers.
 * An empty box reports `undefined` when `optional`, otherwise NaN, which validation then flags.
 */
export function NumberInput({
  value,
  onChange,
  optional = false,
  className = cellInputClass,
  ...rest
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  optional?: boolean;
  className?: string;
} & Omit<ComponentProps<"input">, "value" | "onChange" | "type">) {
  const [text, setText] = useState(formatNumber(value));

  // Follow outside changes (discard, reload) without fighting what the person is typing.
  useEffect(() => {
    setText((current) => {
      const same = current.trim() === "" ? value === undefined || Number.isNaN(value) : Number(current) === value;
      return same ? current : formatNumber(value);
    });
  }, [value]);

  const invalid = text.trim() === "" ? !optional : !Number.isFinite(Number(text));
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={text}
      aria-invalid={invalid || undefined}
      onChange={(e) => {
        const next = e.target.value;
        setText(next);
        if (next.trim() === "") onChange(optional ? undefined : NaN);
        else onChange(Number.isFinite(Number(next)) ? Number(next) : NaN);
      }}
      className={className}
      {...rest}
    />
  );
}

export function NumberField({
  label,
  help,
  value,
  onChange,
  suffix,
  className,
}: {
  label: ReactNode;
  help?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  className?: string;
}) {
  return (
    <Field label={label} help={help} className={className}>
      {(id, describedBy) => (
        <div className="relative">
          <NumberInput
            id={id}
            aria-describedby={describedBy}
            value={value}
            onChange={(n) => onChange(n ?? NaN)}
            className={`${inputClass} tabular-nums ${suffix ? "pr-10" : ""}`}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-subtle">
              {suffix}
            </span>
          )}
        </div>
      )}
    </Field>
  );
}

export function SelectField({
  label,
  help,
  value,
  onChange,
  options,
  className,
}: {
  label: ReactNode;
  help?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Field label={label} help={help} className={className}>
      {(id, describedBy) => (
        <select
          id={id}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          {!options.some((o) => o.value === value) && <option value={value}>Choose…</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = "",
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 text-sm text-muted has-disabled:cursor-not-allowed has-disabled:opacity-40 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 cursor-pointer accent-accent"
      />
      {label}
    </label>
  );
}
