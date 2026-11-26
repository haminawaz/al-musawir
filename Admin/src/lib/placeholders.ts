import { getPageDef } from "./page-schema";
import type { SiteContent } from "./types";

export type PlaceholderHit = { area: string; where: string; field: string; value: string; href: string };

// Text still waiting for real content: anything that says "placeholder", and the dummy WhatsApp number.
const looksLikePlaceholder = (s: string) => /placeholder/i.test(s) || /0{6,}/.test(s);

/** Walks all site content and lists every field that still holds placeholder text. */
export function findPlaceholders(c: SiteContent): PlaceholderHit[] {
  const hits: PlaceholderHit[] = [];
  const add = (area: string, where: string, field: string, value: unknown, href: string) => {
    if (typeof value === "string" && looksLikePlaceholder(value)) hits.push({ area, where, field, value, href });
  };

  const siteFields: [keyof SiteContent["site"], string][] = [
    ["name", "Business name"],
    ["tagline", "Tagline"],
    ["whatsappDisplay", "WhatsApp number (shown)"],
    ["whatsappNumber", "WhatsApp number (link)"],
    ["hours", "Opening hours"],
  ];
  for (const [k, label] of siteFields) add("Settings", "Business details", label, c.site[k], "/settings");

  const projectFields: [keyof SiteContent["projects"][number], string][] = [
    ["client", "Client"],
    ["society", "Society"],
    ["plotNo", "Plot no."],
    ["date", "Date"],
    ["city", "City"],
    ["scale", "Scale"],
    ["status", "Status"],
  ];
  for (const p of c.projects)
    for (const [k, label] of projectFields) add("Projects", p.name, label, p[k], `/projects/${p.slug}`);

  c.services.forEach((s) => {
    add("Services", s.name, "Summary", s.summary, "/services");
    add("Services", s.name, "You receive", s.deliverables, "/services");
  });
  c.surveySpecs.forEach((s) => add("Land survey", s.title, "Text", s.text, "/survey"));
  c.processSteps.forEach((s) => add("Process", s.title, "Text", s.text, "/process"));

  for (const [pageKey, page] of Object.entries(c.pages)) {
    const def = getPageDef(pageKey);
    if (!def) continue;
    for (const section of def.sections) {
      for (const f of section.fields) {
        const value = page[section.key]?.[f.key];
        const where = `${def.title} page › ${section.title}`;
        const href = `/page-text?page=${pageKey}`;
        if (Array.isArray(value))
          value.forEach((item, i) => {
            if (typeof item === "string") add("Page text", where, `${f.label} ${i + 1}`, item, href);
            else {
              add("Page text", where, `${item.label}`, item.value, href);
              add("Page text", where, `Row ${i + 1} label`, item.label, href);
            }
          });
        else add("Page text", where, f.label, value, href);
      }
    }
  }
  return hits;
}
