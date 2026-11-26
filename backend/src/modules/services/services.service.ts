import { db, type DbClient } from "../../db/client.js";
import { ValidationError } from "../../lib/errors.js";
import { recordActivity, type Actor } from "../activity/activity.service.js";
import type { ServiceInput } from "./services.schema.js";

export type ServiceDto = ServiceInput;

export function listServices(client: DbClient): Promise<ServiceDto[]> {
  return client.service.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true, summary: true, deliverables: true },
  });
}

/** Text and order can change; the ids cannot, because the website draws one illustration per id. */
export function updateServices(input: ServiceInput[], actor: Actor): Promise<ServiceDto[]> {
  return db.$transaction(async (tx) => {
    const expected = (await listServices(tx)).map((s) => s.id);
    const given = input.map((s) => s.id);
    if (given.length !== expected.length || !expected.every((id) => given.includes(id)))
      throw new ValidationError([`Services must keep the same ids: ${expected.join(", ")}.`]);

    for (const [position, { id, name, summary, deliverables }] of input.entries())
      await tx.service.update({ where: { id }, data: { name, summary, deliverables, position } });
    await recordActivity(tx, actor, { action: "updated", target: "Services", href: "/services" });
    return listServices(tx);
  });
}
