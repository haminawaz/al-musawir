import { db, type DbClient } from "../../db/client.js";
import { conflict, notFound, ValidationError } from "../../lib/errors.js";
import { recordActivity, relinkActivity, type Actor } from "../activity/activity.service.js";
import { featuredProjectSlug, renameFeaturedProject } from "../pages/pages.service.js";
import { toProjectData, toProjectDto, type ProjectDto } from "./projects.mapper.js";
import type { ProjectInput } from "./projects.schema.js";

// Admin-side project reads and writes. The public API uses projects.queries.ts instead.

const projectNotFound = (slug: string) => notFound(`No project with the web address "${slug}".`);
const dashboardHref = (slug: string) => `/projects/${slug}`;

export async function listProjects(client: DbClient): Promise<ProjectDto[]> {
  const rows = await client.project.findMany({ orderBy: { position: "asc" } });
  return rows.map(toProjectDto);
}

export async function getProject(client: DbClient, slug: string): Promise<ProjectDto> {
  const row = await client.project.findUnique({ where: { slug } });
  if (!row) throw projectNotFound(slug);
  return toProjectDto(row);
}

/** Rules that need the database: the category exists, and the slug is free (unless it is unchanged). */
async function checkReferences(tx: DbClient, input: ProjectInput, originalSlug?: string) {
  const errors: string[] = [];
  // One after the other: queries in a transaction share one connection.
  const slugOwner =
    input.slug === originalSlug ? null : await tx.project.findUnique({ where: { slug: input.slug }, select: { id: true } });
  const category = await tx.category.findUnique({ where: { id: input.category }, select: { id: true } });
  if (slugOwner) errors.push(`Another project already uses the web address "${input.slug}".`);
  if (!category) errors.push("Choose a category.");
  if (errors.length) throw new ValidationError(errors);
}

export function createProject(input: ProjectInput, actor: Actor): Promise<ProjectDto> {
  return db.$transaction(async (tx) => {
    await checkReferences(tx, input);
    const { _max } = await tx.project.aggregate({ _max: { position: true } });
    const row = await tx.project.create({
      data: { ...toProjectData(input), category: { connect: { id: input.category } }, position: (_max.position ?? -1) + 1 },
    });
    await recordActivity(tx, actor, { action: "created", target: row.name, href: dashboardHref(row.slug) });
    return toProjectDto(row);
  });
}

/** Replaces a project. The slug may change: the home hero and older activity entries follow it. */
export function updateProject(slug: string, input: ProjectInput, actor: Actor): Promise<ProjectDto> {
  return db.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) throw projectNotFound(slug);
    await checkReferences(tx, input, slug);

    const row = await tx.project.update({
      where: { id: existing.id },
      data: { ...toProjectData(input), category: { connect: { id: input.category } } },
    });
    if (row.slug !== slug) {
      await renameFeaturedProject(tx, slug, row.slug);
      await relinkActivity(tx, dashboardHref(slug), dashboardHref(row.slug));
    }
    await recordActivity(tx, actor, { action: "updated", target: row.name, href: dashboardHref(row.slug) });
    return toProjectDto(row);
  });
}

export function deleteProject(slug: string, actor: Actor): Promise<{ deleted: string }> {
  return db.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({ where: { slug }, select: { id: true, name: true } });
    if (!existing) throw projectNotFound(slug);
    if ((await featuredProjectSlug(tx)) === slug)
      throw conflict("This plan is shown in the home page hero. Choose another plan there first (Page text › Home › Hero).");

    await tx.project.delete({ where: { id: existing.id } });
    await relinkActivity(tx, dashboardHref(slug), null);
    await recordActivity(tx, actor, { action: "deleted", target: existing.name });
    return { deleted: slug };
  });
}
