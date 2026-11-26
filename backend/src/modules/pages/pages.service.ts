import { db, type DbClient } from "../../db/client.js";
import { notFound, ValidationError } from "../../lib/errors.js";
import { recordActivity, type Actor } from "../activity/activity.service.js";
import { getPageDef, pageKeys, type PageKey } from "./page-definitions.js";
import type { PageContentDto } from "./pages.schema.js";

const unknownPage = (key: string) => notFound(`No page called "${key}". Pages: ${pageKeys.join(", ")}.`);

export async function getPage(client: DbClient, key: string): Promise<PageContentDto> {
  if (!getPageDef(key)) throw unknownPage(key);
  const row = await client.pageContent.findUnique({ where: { key }, select: { content: true } });
  if (!row) throw notFound(`The ${key} page text is not set up yet. Run \`npm run db:seed\`.`);
  return row.content as PageContentDto;
}

/** All page text, keyed by page. */
export async function listPages(client: DbClient): Promise<Record<PageKey, PageContentDto>> {
  const rows = await client.pageContent.findMany({ where: { key: { in: pageKeys } }, select: { key: true, content: true } });
  return Object.fromEntries(rows.map((r) => [r.key, r.content as PageContentDto])) as Record<PageKey, PageContentDto>;
}

/** `content` must already have passed pageSchema(key). */
export function replacePage(key: string, content: PageContentDto, actor: Actor): Promise<PageContentDto> {
  const def = getPageDef(key);
  if (!def) throw unknownPage(key);
  return db.$transaction(async (tx) => {
    if (key === "home") {
      const featured = content.hero?.featuredProject;
      const exists = typeof featured === "string" && (await tx.project.count({ where: { slug: featured } })) > 0;
      if (!exists) throw new ValidationError(["Hero: choose a project that exists."]);
    }
    await tx.pageContent.upsert({ where: { key }, create: { key, content }, update: { content } });
    await recordActivity(tx, actor, { action: "updated", target: `${def.title} page text`, href: `/page-text?page=${key}` });
    return content;
  });
}

// --- The home page hero shows one project's plan. Projects use these to keep that link intact. ---

export async function featuredProjectSlug(tx: DbClient): Promise<string | undefined> {
  const row = await tx.pageContent.findUnique({ where: { key: "home" }, select: { content: true } });
  const featured = (row?.content as PageContentDto | undefined)?.hero?.featuredProject;
  return typeof featured === "string" ? featured : undefined;
}

/** When the featured project's slug changes, the hero follows it. */
export async function renameFeaturedProject(tx: DbClient, oldSlug: string, newSlug: string) {
  const row = await tx.pageContent.findUnique({ where: { key: "home" }, select: { content: true } });
  const content = row?.content as PageContentDto | undefined;
  if (!content?.hero || content.hero.featuredProject !== oldSlug) return;
  const updated = { ...content, hero: { ...content.hero, featuredProject: newSlug } };
  await tx.pageContent.update({ where: { key: "home" }, data: { content: updated } });
}
