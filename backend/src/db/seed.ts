import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { ValidationError } from "../lib/errors.js";
import { formatIssues, list } from "../lib/validation.js";
import { categoriesSchema } from "../modules/categories/categories.schema.js";
import { pageKeys, type PageKey } from "../modules/pages/page-definitions.js";
import { pageSchema, type PageContentDto } from "../modules/pages/pages.schema.js";
import { toProjectData } from "../modules/projects/projects.mapper.js";
import { projectSchema } from "../modules/projects/projects.schema.js";
import { servicesSchema } from "../modules/services/services.schema.js";
import { navigationSchema, siteSchema } from "../modules/site/site.schema.js";
import { processStepsSchema, surveySpecsSchema } from "../modules/titled-lists/titled-lists.schema.js";
import type { PrismaClient } from "../generated/prisma/client.js";

// Loads the website content from the admin panel's JSON files and writes it to the database.
// The files are the ones in admin-panel/src/mock/seed (copied to prisma/seed-data, see the README).
// Every file is checked with the same schemas the API uses, so seeded content follows the same rules
// as content saved from the dashboard.

const FILES = {
  site: "site.json",
  navigation: "navigation.json",
  services: "services.json",
  processSteps: "process-steps.json",
  surveySpecs: "survey-specs.json",
  categories: "categories.json",
  projects: "projects.json",
  pages: "pages.json",
} as const;

async function readJson(dir: string, file: string): Promise<unknown> {
  const fullPath = path.join(dir, file);
  try {
    return JSON.parse(await readFile(fullPath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read ${fullPath}: ${(error as Error).message}`);
  }
}

function check<S extends z.ZodType>(schema: S, value: unknown, file: string): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw new ValidationError(formatIssues(result.error), `${file} has problems`);
  return result.data;
}

export type SeedData = Awaited<ReturnType<typeof loadSeedData>>;

export async function loadSeedData(dir: string) {
  const raw = Object.fromEntries(
    await Promise.all(Object.entries(FILES).map(async ([key, file]) => [key, await readJson(dir, file)] as const)),
  ) as Record<keyof typeof FILES, unknown>;

  const site = check(siteSchema, raw.site, FILES.site);
  const navigation = check(navigationSchema, raw.navigation, FILES.navigation);
  const services = check(servicesSchema, raw.services, FILES.services);
  const processSteps = check(processStepsSchema, raw.processSteps, FILES.processSteps);
  const surveySpecs = check(surveySpecsSchema, raw.surveySpecs, FILES.surveySpecs);
  const categories = check(categoriesSchema, raw.categories, FILES.categories);
  const projects = check(list(projectSchema, "Projects", 0, 500), raw.projects, FILES.projects);

  if (typeof raw.pages !== "object" || raw.pages === null) throw new Error(`${FILES.pages} must be an object of pages.`);
  const pagesIn = raw.pages as Record<string, unknown>;
  const pages = {} as Record<PageKey, PageContentDto>;
  for (const key of pageKeys) {
    if (!(key in pagesIn)) throw new Error(`${FILES.pages} has no "${key}" page.`);
    pages[key] = check(pageSchema(key)!, pagesIn[key], `${FILES.pages} › ${key}`) as PageContentDto;
  }

  // Rules that span files.
  const problems: string[] = [];
  const categoryIds = new Set(categories.map((c) => c.id));
  const slugs = new Set<string>();
  for (const p of projects) {
    if (slugs.has(p.slug)) problems.push(`Two projects use the web address "${p.slug}".`);
    slugs.add(p.slug);
    if (!categoryIds.has(p.category)) problems.push(`Project "${p.slug}" uses category "${p.category}", which is not in ${FILES.categories}.`);
  }
  const featured = pages.home.hero?.featuredProject;
  if (typeof featured !== "string" || !slugs.has(featured))
    problems.push(`Home › Hero › featuredProject is "${String(featured)}", which is not a project in ${FILES.projects}.`);
  if (problems.length) throw new ValidationError(problems, "The seed files do not fit together");

  return { site, navigation, services, processSteps, surveySpecs, categories, projects, pages };
}

/**
 * fill  (default) writes each kind of content only where the database has none yet, so running it
 *       again never overwrites changes made in the dashboard.
 * reset replaces all website content (and clears the activity log) with the files' content.
 * The admin account is never touched here.
 */
export async function seedContent(client: PrismaClient, data: SeedData, { reset = false } = {}) {
  return client.$transaction(
    async (tx) => {
      const seeded: string[] = [];
      if (reset) {
        await tx.project.deleteMany(); // first: categories cannot be deleted while projects use them
        await tx.category.deleteMany();
        await tx.navLink.deleteMany();
        await tx.service.deleteMany();
        await tx.processStep.deleteMany();
        await tx.surveySpec.deleteMany();
        await tx.pageContent.deleteMany();
        await tx.siteSettings.deleteMany();
        await tx.activity.deleteMany();
      }
      const positioned = <T extends object>(items: T[]) => items.map((item, position) => ({ ...item, position }));

      if ((await tx.siteSettings.count()) === 0) {
        const { seo, ...site } = data.site;
        await tx.siteSettings.create({ data: { id: 1, ...site, seoTitle: seo.title, seoDescription: seo.description } });
        seeded.push("site settings");
      }
      if ((await tx.navLink.count()) === 0) {
        await tx.navLink.createMany({ data: positioned(data.navigation) });
        seeded.push(`${data.navigation.length} navigation links`);
      }
      if ((await tx.service.count()) === 0) {
        await tx.service.createMany({ data: positioned(data.services) });
        seeded.push(`${data.services.length} services`);
      }
      if ((await tx.processStep.count()) === 0) {
        await tx.processStep.createMany({ data: positioned(data.processSteps) });
        seeded.push(`${data.processSteps.length} process steps`);
      }
      if ((await tx.surveySpec.count()) === 0) {
        await tx.surveySpec.createMany({ data: positioned(data.surveySpecs) });
        seeded.push(`${data.surveySpecs.length} survey details`);
      }
      if ((await tx.category.count()) === 0) {
        await tx.category.createMany({ data: positioned(data.categories) });
        seeded.push(`${data.categories.length} categories`);
      }
      if ((await tx.project.count()) === 0) {
        await tx.project.createMany({
          data: data.projects.map((p, position) => ({ ...toProjectData(p), categoryId: p.category, position })),
        });
        seeded.push(`${data.projects.length} projects`);
      }
      const existingPages = new Set((await tx.pageContent.findMany({ select: { key: true } })).map((p) => p.key));
      const missingPages = pageKeys.filter((key) => !existingPages.has(key));
      if (missingPages.length) {
        await tx.pageContent.createMany({ data: missingPages.map((key) => ({ key, content: data.pages[key] })) });
        seeded.push(`text for ${missingPages.length} page${missingPages.length === 1 ? "" : "s"} (${missingPages.join(", ")})`);
      }
      return seeded;
    },
    { timeout: 60_000 },
  );
}
