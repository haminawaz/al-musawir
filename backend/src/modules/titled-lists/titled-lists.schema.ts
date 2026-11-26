import { z } from "zod";
import { list, object, text } from "../../lib/validation.js";

/** A list of { title, text }: the process steps and the land survey details. */
function titledList(label: string, max: number) {
  return list(object({ title: text(`${label} {n} title`, { max: 200 }), text: text(`${label} {n} text`) }, `${label} {n} must be an object.`), label, 1, max);
}

export const processStepsSchema = titledList("Step", 8);
export const surveySpecsSchema = titledList("Detail", 12);

export type TitledItem = z.output<typeof processStepsSchema>[number];
