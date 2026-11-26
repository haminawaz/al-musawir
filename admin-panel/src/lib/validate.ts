import { getPageDef } from "./page-schema";
import type { Category, NavLink, Project, Service } from "./types";

// Each validator takes untrusted input and returns a list of readable problems (empty = valid).
// The dashboard runs them before saving; the mock API runs them again on every write.

type Errors = string[];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TEXT = 2000;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function text(errors: Errors, value: unknown, label: string, required = true) {
  if (typeof value !== "string") return void errors.push(`${label} must be text.`);
  if (required && !value.trim()) return void errors.push(`${label} is required.`);
  if (value.length > MAX_TEXT) errors.push(`${label} is too long (${MAX_TEXT} characters max).`);
}

function number(errors: Errors, value: unknown, label: string, opts: { min?: number; positive?: boolean } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) return void errors.push(`${label} must be a number.`);
  if (opts.positive && value <= 0) errors.push(`${label} must be more than 0.`);
  if (opts.min !== undefined && value < opts.min) errors.push(`${label} must be ${opts.min} or more.`);
  if (value > 10000) errors.push(`${label} is too large.`);
}

function list(errors: Errors, value: unknown, label: string, min = 1, max = 50): value is unknown[] {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be a list.`);
    return false;
  }
  if (value.length < min) errors.push(`${label} needs at least ${min} item${min === 1 ? "" : "s"}.`);
  if (value.length > max) errors.push(`${label} can have at most ${max} items.`);
  return true;
}

export function validateSite(v: unknown): Errors {
  const e: Errors = [];
  if (!isObject(v)) return ["Site settings must be an object."];
  text(e, v.name, "Business name");
  text(e, v.tagline, "Tagline");
  text(e, v.headerLabel, "Header label", false);
  text(e, v.hours, "Opening hours");
  text(e, v.whatsappDisplay, "WhatsApp number (shown)");
  if (typeof v.whatsappNumber !== "string" || !/^\d{8,15}$/.test(v.whatsappNumber))
    e.push("WhatsApp number (link) must be 8 to 15 digits with the country code, no spaces or +, e.g. 923001234567.");
  if (!isObject(v.seo)) e.push("SEO must be an object.");
  else {
    text(e, v.seo.title, "Search title");
    text(e, v.seo.description, "Search description");
  }
  return e;
}

/** Labels and order can change; the pages themselves are fixed by the website. */
export function validateNavigation(v: unknown, current: NavLink[]): Errors {
  const e: Errors = [];
  if (!list(e, v, "Navigation")) return e;
  v.forEach((link, i) => {
    if (!isObject(link)) return void e.push(`Link ${i + 1} must be an object.`);
    text(e, link.label, `Link ${i + 1} label`);
  });
  const hrefs = v.map((l) => (isObject(l) ? l.href : undefined));
  const expected = current.map((l) => l.href);
  if (hrefs.length !== expected.length || !expected.every((h) => hrefs.includes(h)))
    e.push(`Navigation must keep the same pages: ${expected.join(", ")}.`);
  return e;
}

/** The website has one illustration per service, so the set of ids is fixed. */
export function validateServices(v: unknown, current: Service[]): Errors {
  const e: Errors = [];
  if (!list(e, v, "Services")) return e;
  v.forEach((s, i) => {
    if (!isObject(s)) return void e.push(`Service ${i + 1} must be an object.`);
    const n = typeof s.name === "string" && s.name.trim() ? s.name : `Service ${i + 1}`;
    text(e, s.name, `Service ${i + 1} name`);
    text(e, s.summary, `${n}: summary`);
    text(e, s.deliverables, `${n}: you receive`);
  });
  const ids = v.map((s) => (isObject(s) ? s.id : undefined));
  const expected = current.map((s) => s.id);
  if (ids.length !== expected.length || !expected.every((id) => ids.includes(id)))
    e.push(`Services must keep the same four ids: ${expected.join(", ")}.`);
  return e;
}

/** Process steps and survey specs: a list of { title, text }. */
export function validateTitledList(v: unknown, label: string, max = 12): Errors {
  const e: Errors = [];
  if (!list(e, v, label, 1, max)) return e;
  v.forEach((item, i) => {
    if (!isObject(item)) return void e.push(`${label} ${i + 1} must be an object.`);
    text(e, item.title, `${label} ${i + 1} title`);
    text(e, item.text, `${label} ${i + 1} text`);
  });
  return e;
}

export function validateCategories(v: unknown, projects: Project[]): Errors {
  const e: Errors = [];
  if (!list(e, v, "Categories", 1, 30)) return e;
  const seen = new Set<string>();
  v.forEach((c, i) => {
    if (!isObject(c)) return void e.push(`Category ${i + 1} must be an object.`);
    text(e, c.label, `Category ${i + 1} name`);
    if (typeof c.id !== "string" || !SLUG_PATTERN.test(c.id))
      e.push(`Category ${i + 1} id must be lowercase letters, numbers and dashes, e.g. 2-kanal.`);
    else if (seen.has(c.id)) e.push(`Two categories have the id "${c.id}".`);
    else seen.add(c.id);
  });
  for (const id of new Set(projects.map((p) => p.category))) {
    if (!seen.has(id)) {
      const count = projects.filter((p) => p.category === id).length;
      e.push(`"${id}" is used by ${count} project${count === 1 ? "" : "s"}. Move ${count === 1 ? "it" : "them"} to another category first.`);
    }
  }
  return e;
}

export function validateProject(v: unknown, ctx: { categories: Category[]; projects: Project[]; originalSlug?: string }): Errors {
  const e: Errors = [];
  if (!isObject(v)) return ["Project must be an object."];
  text(e, v.name, "Name");
  if (typeof v.slug !== "string" || !SLUG_PATTERN.test(v.slug))
    e.push("Web address must be lowercase letters, numbers and dashes, e.g. family-house-5-marla.");
  else if (v.slug !== ctx.originalSlug && ctx.projects.some((p) => p.slug === v.slug))
    e.push(`Another project already uses the web address "${v.slug}".`);
  if (typeof v.category !== "string" || !ctx.categories.some((c) => c.id === v.category)) e.push("Choose a category.");
  text(e, v.drawingNo, "Drawing no.");
  for (const [key, label] of [
    ["city", "City"],
    ["society", "Society"],
    ["client", "Client"],
    ["plotNo", "Plot no."],
    ["floors", "Floors"],
    ["scale", "Scale"],
    ["date", "Date"],
    ["status", "Status"],
  ] as const)
    text(e, v[key], label, false);

  const plot = v.plot;
  if (!isObject(plot) || !isObject(plot.setbacks)) {
    e.push("Plot size and setbacks are required.");
  } else {
    number(e, plot.width, "Plot width", { positive: true });
    number(e, plot.depth, "Plot depth", { positive: true });
    number(e, plot.road, "Road width", { positive: true });
    const sb = plot.setbacks;
    for (const side of ["front", "rear", "left", "right"] as const) number(e, sb[side], `${side[0].toUpperCase()}${side.slice(1)} setback`, { min: 0 });
    const all = [plot.width, plot.depth, sb.front, sb.rear, sb.left, sb.right];
    if (all.every((n) => typeof n === "number")) {
      const [w, d, f, r, l, rt] = all as number[];
      if (l + rt >= w) e.push("Side setbacks leave no width to build on.");
      if (f + r >= d) e.push("Front and rear setbacks leave no depth to build on.");
    }
  }

  if (list(e, v.rooms, "Rooms", 0, 60)) {
    v.rooms.forEach((r, i) => {
      if (!isObject(r)) return void e.push(`Room ${i + 1} must be an object.`);
      const n = typeof r.name === "string" && r.name.trim() ? r.name : `Room ${i + 1}`;
      text(e, r.name, `Room ${i + 1} name`);
      number(e, r.x, `${n}: X`, { min: 0 });
      number(e, r.y, `${n}: Y`, { min: 0 });
      number(e, r.w, `${n}: width`, { positive: true });
      number(e, r.d, `${n}: depth`, { positive: true });
      if (r.stairs !== undefined && typeof r.stairs !== "boolean") e.push(`${n}: stairs must be yes or no.`);
      if (r.label !== undefined) {
        if (!isObject(r.label)) e.push(`${n}: label position must be an object.`);
        else {
          number(e, r.label.x, `${n}: label X`);
          number(e, r.label.y, `${n}: label Y`);
          if (r.label.size !== undefined) number(e, r.label.size, `${n}: label size`, { positive: true });
        }
      }
    });
  }

  if (list(e, v.openings, "Doors and windows", 0, 200)) {
    v.openings.forEach((o, i) => {
      if (!isObject(o)) return void e.push(`Opening ${i + 1} must be an object.`);
      const n = `Opening ${i + 1}`;
      if (o.type !== "door" && o.type !== "window") e.push(`${n}: type must be door or window.`);
      number(e, o.x, `${n}: X`);
      number(e, o.y, `${n}: Y`);
      number(e, o.width, `${n}: width`, { positive: true });
      if (![0, 90, 180, -90].includes(o.rotate as number)) e.push(`${n}: rotation must be 0, 90, 180 or -90.`);
      if (o.entrance !== undefined && typeof o.entrance !== "boolean") e.push(`${n}: entrance must be yes or no.`);
    });
  }
  return e;
}

/** Non-blocking checks shown next to the plan preview. */
export function projectWarnings(p: Project): string[] {
  const w: string[] = [];
  const { width, depth } = p.plot;
  const names = new Map<string, number>();
  for (const r of p.rooms) {
    names.set(r.name.trim(), (names.get(r.name.trim()) ?? 0) + 1);
    if (r.x + r.w > width + 0.01 || r.y + r.d > depth + 0.01) w.push(`${r.name || "A room"} runs outside the plot.`);
  }
  for (const [name, count] of names) if (name && count > 1) w.push(`${count} rooms are called "${name}".`);
  for (const o of p.openings) {
    if (o.x < 0 || o.y < 0 || o.x > width || o.y > depth) w.push(`A ${o.type} at ${o.x}, ${o.y} is outside the plot.`);
  }
  if (p.openings.length && !p.openings.some((o) => o.entrance)) w.push("No door is marked as the entrance.");
  return w;
}

export function validatePage(key: string, v: unknown): Errors {
  const def = getPageDef(key);
  if (!def) return [`Unknown page "${key}".`];
  if (!isObject(v)) return [`${def.title} must be an object.`];
  const e: Errors = [];
  for (const section of def.sections) {
    const s = v[section.key];
    if (!isObject(s)) {
      e.push(`${section.title} is missing.`);
      continue;
    }
    for (const f of section.fields) {
      const label = `${section.title}: ${f.label}`;
      const value = s[f.key];
      if (f.type === "list") {
        if (list(e, value, label, 1, 30)) value.forEach((item, i) => text(e, item, `${label} ${i + 1}`));
      } else if (f.type === "pairs") {
        if (list(e, value, label, 1, 30))
          value.forEach((row, i) => {
            if (!isObject(row)) return void e.push(`${label} row ${i + 1} must be an object.`);
            text(e, row.label, `${label} row ${i + 1} label`);
            text(e, row.value, `${label} row ${i + 1} value`);
          });
      } else {
        text(e, value, label);
      }
    }
  }
  return e;
}
