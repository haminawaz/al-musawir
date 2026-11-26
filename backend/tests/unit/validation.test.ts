import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatIssues } from "../../src/lib/validation.js";
import { categoriesSchema } from "../../src/modules/categories/categories.schema.js";
import { pageSchema } from "../../src/modules/pages/pages.schema.js";
import { projectListQuerySchema, projectSchema } from "../../src/modules/projects/projects.schema.js";
import { siteSchema } from "../../src/modules/site/site.schema.js";

const seed = (file: string) => JSON.parse(readFileSync(new URL(`../../prisma/seed-data/${file}`, import.meta.url), "utf8"));
const problems = (schema: { safeParse: (v: unknown) => { success: boolean; error?: unknown } }, value: unknown) => {
  const result = schema.safeParse(value);
  return result.success ? [] : formatIssues(result.error as never);
};

describe("seed files pass the API's own rules", () => {
  it("site", () => expect(problems(siteSchema, seed("site.json"))).toEqual([]));
  it("categories", () => expect(problems(categoriesSchema, seed("categories.json"))).toEqual([]));
  it("projects", () => {
    for (const p of seed("projects.json")) expect(problems(projectSchema, p), p.slug).toEqual([]);
  });
  it("every page", () => {
    const pages = seed("pages.json");
    for (const key of Object.keys(pages)) expect(problems(pageSchema(key)!, pages[key]), key).toEqual([]);
  });
});

describe("project rules", () => {
  const valid = seed("projects.json")[0];

  it("explains each problem in words, numbering rooms and openings", () => {
    const bad = {
      ...valid,
      slug: "Not A Slug",
      name: "  ",
      plot: { ...valid.plot, setbacks: { ...valid.plot.setbacks, left: 20, right: 10 } },
      rooms: [valid.rooms[0], { ...valid.rooms[1], w: 0 }],
      openings: [{ ...valid.openings[0], rotate: 45 }],
    };
    expect(problems(projectSchema, bad)).toEqual([
      "Web address must be lowercase letters, numbers and dashes, e.g. family-house-5-marla.",
      "Name is required.",
      "Side setbacks leave no width to build on.",
      "Room 2 width must be more than 0.",
      "Opening 1: rotation must be 0, 90, 180 or -90.",
    ]);
  });

  it("drops fields that are not part of a project", () => {
    const result = projectSchema.parse({ ...valid, isAdmin: true, rooms: [{ ...valid.rooms[0], evil: "x" }] });
    expect(result).not.toHaveProperty("isAdmin");
    expect(result.rooms[0]).not.toHaveProperty("evil");
  });

  it("reports missing fields as required", () => {
    const { drawingNo: _, ...withoutDrawingNo } = valid;
    expect(problems(projectSchema, withoutDrawingNo)).toEqual(["Drawing no. is required."]);
  });

  it("rejects non-objects", () => {
    expect(problems(projectSchema, "nope")).toEqual(["Project must be an object."]);
  });
});

describe("other rules", () => {
  it("WhatsApp number must be digits only", () => {
    expect(problems(siteSchema, { ...seed("site.json"), whatsappNumber: "+92 300" })).toEqual([
      "WhatsApp number (link) must be 8 to 15 digits with the country code, no spaces or +, e.g. 923001234567.",
    ]);
  });

  it("category ids must be unique", () => {
    expect(problems(categoriesSchema, [{ id: "a", label: "A" }, { id: "a", label: "B" }])).toEqual(['Two categories have the id "a".']);
  });

  it("page text names the section and field", () => {
    const home = seed("pages.json").home;
    const bad = { ...home, hero: { ...home.hero, rotatingWords: [] }, marquee: undefined };
    expect(problems(pageSchema("home")!, bad)).toEqual(["Hero: Rotating words needs at least 1 item.", "Scrolling text is missing."]);
  });

  it("unknown pages have no schema", () => expect(pageSchema("admin")).toBeUndefined());

  it("public list query is bounded", () => {
    expect(projectListQuerySchema.parse({ category: "5-marla", limit: "3" })).toEqual({ category: "5-marla", limit: 3 });
    expect(projectListQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
    expect(projectListQuerySchema.safeParse({ category: "'; drop table" }).success).toBe(false);
  });
});
