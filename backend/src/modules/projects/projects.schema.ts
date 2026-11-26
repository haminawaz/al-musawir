import { z } from "zod";
import { list, num, object, slug, text } from "../../lib/validation.js";

// The same rules as the dashboard's validateProject (admin-panel/src/lib/validate.ts).
// All geometry is in feet; the origin is the rear-left corner of the plot.

const optionalText = (label: string) => text(label, { required: false, max: 200 });

const roomSchema = object(
  {
    name: text("Room {n} name", { max: 100 }),
    x: num("Room {n} X", { min: 0 }),
    y: num("Room {n} Y", { min: 0 }),
    w: num("Room {n} width", { positive: true }),
    d: num("Room {n} depth", { positive: true }),
    stairs: z.boolean({ error: "Room {n} stairs must be yes or no." }).optional(),
    label: object(
      {
        x: num("Room {n} label X"),
        y: num("Room {n} label Y"),
        size: num("Room {n} label size", { positive: true }).optional(),
      },
      "Room {n} label position must be an object.",
    ).optional(),
  },
  "Room {n} must be an object.",
);

const openingSchema = object(
  {
    type: z.enum(["door", "window"], { error: "Opening {n}: type must be door or window." }),
    x: num("Opening {n}: X"),
    y: num("Opening {n}: Y"),
    rotate: z.literal([0, 90, 180, -90], { error: "Opening {n}: rotation must be 0, 90, 180 or -90." }),
    width: num("Opening {n}: width", { positive: true }),
    entrance: z.boolean({ error: "Opening {n}: entrance must be yes or no." }).optional(),
  },
  "Opening {n} must be an object.",
);

const plotSchema = object(
  {
    width: num("Plot width", { positive: true }),
    depth: num("Plot depth", { positive: true }),
    road: num("Road width", { positive: true }),
    setbacks: object(
      {
        front: num("Front setback", { min: 0 }),
        rear: num("Rear setback", { min: 0 }),
        left: num("Left setback", { min: 0 }),
        right: num("Right setback", { min: 0 }),
      },
      "Plot size and setbacks are required.",
    ),
  },
  "Plot size and setbacks are required.",
).superRefine(({ width, depth, setbacks: s }, ctx) => {
  if (s.left + s.right >= width) ctx.addIssue({ code: "custom", message: "Side setbacks leave no width to build on." });
  if (s.front + s.rear >= depth) ctx.addIssue({ code: "custom", message: "Front and rear setbacks leave no depth to build on." });
});

export const projectSchema = object(
  {
    slug: slug("Web address must be lowercase letters, numbers and dashes, e.g. family-house-5-marla."),
    name: text("Name", { max: 200 }),
    category: z.string({ error: "Choose a category." }).max(120, { error: "Choose a category." }),
    city: optionalText("City"),
    society: optionalText("Society"),
    client: optionalText("Client"),
    plotNo: optionalText("Plot no."),
    floors: optionalText("Floors"),
    drawingNo: text("Drawing no.", { max: 100 }),
    scale: optionalText("Scale"),
    date: optionalText("Date"),
    status: optionalText("Status"),
    plot: plotSchema,
    rooms: list(roomSchema, "Rooms", 0, 60),
    openings: list(openingSchema, "Doors and windows", 0, 200),
  },
  "Project must be an object.",
);

export type ProjectInput = z.output<typeof projectSchema>;
export type Room = ProjectInput["rooms"][number];
export type Opening = ProjectInput["openings"][number];
export type Plot = ProjectInput["plot"];

/** Query string of GET /api/v1/projects. */
export const projectListQuerySchema = z.object({
  category: slug("category must be a category id, e.g. 5-marla.").optional(),
  limit: z.coerce
    .number({ error: "limit must be a whole number from 1 to 100." })
    .int({ error: "limit must be a whole number from 1 to 100." })
    .min(1, { error: "limit must be a whole number from 1 to 100." })
    .max(100, { error: "limit must be a whole number from 1 to 100." })
    .optional(),
});

export const slugParamSchema = slug("That is not a valid project web address.");
