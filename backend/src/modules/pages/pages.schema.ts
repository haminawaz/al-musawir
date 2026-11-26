import { z } from "zod";
import { list, object, text } from "../../lib/validation.js";
import { getPageDef, type FieldDef, type PageDef } from "./page-definitions.js";

// Builds one schema per page from page-definitions.ts. Fields the definitions do not list are dropped.

function fieldSchema(field: FieldDef, label: string): z.ZodType {
  switch (field.type) {
    case "list":
      return list(text(`${label} {n}`), label, 1, 30);
    case "pairs":
      return list(
        object({ label: text(`${label} row {n} label`), value: text(`${label} row {n} value`) }, `${label} row {n} must be an object.`),
        label,
        1,
        30,
      );
    default:
      return text(label);
  }
}

function buildPageSchema(def: PageDef) {
  const sections = def.sections.map((section) => {
    const fields = section.fields.map((field) => [field.key, fieldSchema(field, `${section.title}: ${field.label}`)] as const);
    return [section.key, object(Object.fromEntries(fields), `${section.title} is missing.`)] as const;
  });
  return object(Object.fromEntries(sections), `${def.title} must be an object.`);
}

export type FieldValue = string | string[] | { label: string; value: string }[];
/** section -> field -> value */
export type PageContentDto = Record<string, Record<string, FieldValue>>;

const cache = new Map<string, z.ZodType<PageContentDto>>();

/** The schema for one page, or undefined for an unknown page. */
export function pageSchema(key: string): z.ZodType<PageContentDto> | undefined {
  const def = getPageDef(key);
  if (!def) return undefined;
  let schema = cache.get(key);
  // The built object's fields are exactly the FieldValue shapes above.
  if (!schema) cache.set(key, (schema = buildPageSchema(def) as unknown as z.ZodType<PageContentDto>));
  return schema;
}
