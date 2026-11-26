import { z } from "zod";
import { list, object, text } from "../../lib/validation.js";

export const servicesSchema = list(
  object(
    {
      id: z.string({ error: "Service {n} id must be text." }).max(60, { error: "Service {n} id is too long." }),
      name: text("Service {n} name", { max: 200 }),
      summary: text("Service {n} summary"),
      deliverables: text("Service {n}: you receive"),
    },
    "Service {n} must be an object.",
  ),
  "Services",
  1,
  20,
);

export type ServiceInput = z.output<typeof servicesSchema>[number];
