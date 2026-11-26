import { db, type DbClient } from "../../db/client.js";
import { recordActivity, type Actor } from "../activity/activity.service.js";
import type { TitledItem } from "./titled-lists.schema.js";

// Process steps and land survey details. Each list is saved as a whole: PUT replaces every item.

const byPosition = { orderBy: { position: "asc" }, select: { title: true, text: true } } as const;
const withPositions = (items: TitledItem[]) => items.map(({ title, text }, position) => ({ title, text, position }));

export function listProcessSteps(client: DbClient): Promise<TitledItem[]> {
  return client.processStep.findMany(byPosition);
}

export function replaceProcessSteps(items: TitledItem[], actor: Actor): Promise<TitledItem[]> {
  return db.$transaction(async (tx) => {
    await tx.processStep.deleteMany();
    await tx.processStep.createMany({ data: withPositions(items) });
    await recordActivity(tx, actor, { action: "updated", target: "Process steps", href: "/process" });
    return listProcessSteps(tx);
  });
}

export function listSurveySpecs(client: DbClient): Promise<TitledItem[]> {
  return client.surveySpec.findMany(byPosition);
}

export function replaceSurveySpecs(items: TitledItem[], actor: Actor): Promise<TitledItem[]> {
  return db.$transaction(async (tx) => {
    await tx.surveySpec.deleteMany();
    await tx.surveySpec.createMany({ data: withPositions(items) });
    await recordActivity(tx, actor, { action: "updated", target: "Land survey details", href: "/survey" });
    return listSurveySpecs(tx);
  });
}
