import { z } from "zod";
import { list, object, slug, text } from "../../lib/validation.js";

export const categoriesSchema = list(
  object(
    {
      id: slug("Category {n} id must be lowercase letters, numbers and dashes, e.g. 2-kanal."),
      label: text("Category {n} name", { max: 100 }),
    },
    "Category {n} must be an object.",
  ),
  "Categories",
  1,
  30,
).superRefine((categories, ctx) => {
  const seen = new Set<string>();
  for (const { id } of categories) {
    if (seen.has(id)) ctx.addIssue({ code: "custom", message: `Two categories have the id "${id}".` });
    seen.add(id);
  }
});

export type CategoryInput = z.output<typeof categoriesSchema>[number];
