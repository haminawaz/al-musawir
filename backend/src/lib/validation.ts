import { z } from "zod";

// Building blocks for request schemas. Every message is written for the person filling in the form,
// in the same words the dashboard's own checks use (admin-panel/src/lib/validate.ts).
//
// Labels inside list items can contain "{n}": it is replaced with the item's position (1-based),
// so "Room {n} name is required." becomes "Room 3 name is required.".

export const MAX_TEXT = 2000;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const missing = (input: unknown) => input === undefined || input === null;

/** Text. `required` means it must contain more than spaces. */
export function text(label: string, { required = true, max = MAX_TEXT }: { required?: boolean; max?: number } = {}) {
  const base = z
    .string({ error: (iss) => (missing(iss.input) ? `${label} is required.` : `${label} must be text.`) })
    .max(max, { error: `${label} is too long (${max} characters max).` });
  return required ? base.refine((v) => v.trim().length > 0, { error: `${label} is required.` }) : base;
}

/** A number, limited to sizes a plot drawing can have. */
export function num(label: string, opts: { min?: number; positive?: boolean } = {}) {
  let n = z.number({ error: (iss) => (missing(iss.input) ? `${label} is required.` : `${label} must be a number.`) });
  if (opts.positive) n = n.gt(0, { error: `${label} must be more than 0.` });
  if (opts.min !== undefined) n = n.min(opts.min, { error: `${label} must be ${opts.min} or more.` });
  return n.max(10_000, { error: `${label} is too large.` });
}

/** Lowercase letters, numbers and dashes, as used in web addresses. */
export function slug(message: string) {
  return z.string({ error: message }).max(120, { error: message }).regex(SLUG_PATTERN, { error: message });
}

export function list<T extends z.ZodType>(item: T, label: string, min = 1, max = 50) {
  return z
    .array(item, { error: `${label} must be a list.` })
    .min(min, { error: `${label} needs at least ${min} item${min === 1 ? "" : "s"}.` })
    .max(max, { error: `${label} can have at most ${max} items.` });
}

export function object<T extends z.ZodRawShape>(shape: T, label: string) {
  return z.object(shape, { error: label });
}

/** Turns zod issues into the readable list sent as `details`. */
export function formatIssues(error: z.ZodError): string[] {
  const messages = error.issues.map((issue) => {
    const index = [...issue.path].reverse().find((p): p is number => typeof p === "number");
    return issue.message.replaceAll("{n}", index === undefined ? "" : String(index + 1));
  });
  return [...new Set(messages)];
}
