import type { DbClient } from "../../db/client.js";
import type { ActivityAction } from "../../generated/prisma/client.js";

const LATEST = 50;

/** Who made a change: the admin's name, as shown in the dashboard's activity list. */
export type Actor = { name: string };

export type Change = { action: ActivityAction; target: string; href?: string | null };

/** Same shape as the dashboard's Activity type. */
export type ActivityDto = { id: string; at: string; user: string; action: ActivityAction; target: string; href?: string };

/** Call inside the transaction that makes the change, so the log never lists a change that did not happen. */
export function recordActivity(tx: DbClient, actor: Actor, change: Change) {
  return tx.activity.create({
    data: { userName: actor.name, action: change.action, target: change.target, href: change.href ?? null },
  });
}

/** Older entries follow a renamed item (newHref) or stop linking to a deleted one (null). */
export function relinkActivity(tx: DbClient, oldHref: string, newHref: string | null) {
  return tx.activity.updateMany({ where: { href: oldHref }, data: { href: newHref } });
}

export async function listActivity(client: DbClient): Promise<ActivityDto[]> {
  const rows = await client.activity.findMany({ orderBy: { createdAt: "desc" }, take: LATEST });
  return rows.map((a) => ({
    id: a.id,
    at: a.createdAt.toISOString(),
    user: a.userName,
    action: a.action,
    target: a.target,
    ...(a.href ? { href: a.href } : {}),
  }));
}
