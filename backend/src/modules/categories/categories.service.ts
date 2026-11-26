import { db, type DbClient } from "../../db/client.js";
import { ValidationError } from "../../lib/errors.js";
import { recordActivity, type Actor } from "../activity/activity.service.js";
import type { CategoryInput } from "./categories.schema.js";

export type CategoryDto = { id: string; label: string };
/** Public shape: with the number of projects, for the filter buttons on the projects page. */
export type CategoryWithCountDto = CategoryDto & { projectCount: number };

export function listCategories(client: DbClient): Promise<CategoryDto[]> {
  return client.category.findMany({ orderBy: { position: "asc" }, select: { id: true, label: true } });
}

export async function listCategoriesWithCounts(client: DbClient): Promise<CategoryWithCountDto[]> {
  const rows = await client.category.findMany({
    orderBy: { position: "asc" },
    select: { id: true, label: true, _count: { select: { projects: true } } },
  });
  return rows.map(({ id, label, _count }) => ({ id, label, projectCount: _count.projects }));
}

/**
 * Replaces the list. A category that projects still use cannot be removed (422);
 * the foreign key also refuses it, so a project saved at the same moment cannot slip through.
 */
export function replaceCategories(input: CategoryInput[], actor: Actor): Promise<CategoryDto[]> {
  return db.$transaction(async (tx) => {
    const ids = input.map((c) => c.id);
    const stillUsed = await tx.project.groupBy({
      by: ["categoryId"],
      where: { categoryId: { notIn: ids } },
      _count: { _all: true },
      orderBy: { categoryId: "asc" },
    });
    if (stillUsed.length)
      throw new ValidationError(
        stillUsed.map(({ categoryId, _count }) => {
          const n = _count._all;
          return `"${categoryId}" is used by ${n} project${n === 1 ? "" : "s"}. Move ${n === 1 ? "it" : "them"} to another category first.`;
        }),
      );

    await tx.category.deleteMany({ where: { id: { notIn: ids } } });
    for (const [position, { id, label }] of input.entries())
      await tx.category.upsert({ where: { id }, create: { id, label, position }, update: { label, position } });
    await recordActivity(tx, actor, { action: "updated", target: "Categories", href: "/categories" });
    return listCategories(tx);
  });
}
