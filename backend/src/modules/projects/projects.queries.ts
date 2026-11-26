import type { DbClient } from "../../db/client.js";
import { notFound } from "../../lib/errors.js";
import { summarySelect, toProjectDto, toProjectSummaryDto, type ProjectDto, type ProjectSummaryDto } from "./projects.mapper.js";

// Read-only project queries for the public API, each shaped for one page of the website
// so no page downloads more than it shows.

/** Project cards (projects page, home page). Doors, windows and title-block details are left out. */
export async function listProjectSummaries(
  client: DbClient,
  { category, limit }: { category?: string; limit?: number },
): Promise<ProjectSummaryDto[]> {
  const rows = await client.project.findMany({
    ...(category ? { where: { categoryId: category } } : {}),
    orderBy: { position: "asc" },
    ...(limit ? { take: limit } : {}),
    select: summarySelect,
  });
  return rows.map(toProjectSummaryDto);
}

/** Every project's web address, for static page generation and sitemaps. */
export function listProjectSlugs(client: DbClient): Promise<{ slug: string; updatedAt: Date }[]> {
  return client.project.findMany({ orderBy: { position: "asc" }, select: { slug: true, updatedAt: true } });
}

/** One full project, plus the cards of the projects before and after it ("more projects" links). */
export async function getProjectWithNeighbours(
  client: DbClient,
  slug: string,
): Promise<{ project: ProjectDto; previous: ProjectSummaryDto | null; next: ProjectSummaryDto | null }> {
  const row = await client.project.findUnique({ where: { slug } });
  if (!row) throw notFound(`No project with the web address "${slug}".`);
  const [previous, next] = await Promise.all([
    client.project.findFirst({ where: { position: { lt: row.position } }, orderBy: { position: "desc" }, select: summarySelect }),
    client.project.findFirst({ where: { position: { gt: row.position } }, orderBy: { position: "asc" }, select: summarySelect }),
  ]);
  return {
    project: toProjectDto(row),
    previous: previous && toProjectSummaryDto(previous),
    next: next && toProjectSummaryDto(next),
  };
}
