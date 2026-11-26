import type { Prisma, Project as ProjectRow } from "../../generated/prisma/client.js";
import type { Opening, Plot, ProjectInput, Room } from "./projects.schema.js";

// Converts between database rows and the API's Project shape (the same shape as the website's
// src/data/projects.ts and the dashboard's types).

export type ProjectDto = ProjectInput;

/** A project card: enough to draw the thumbnail and its numbers, without doors, windows or title-block details. */
export type ProjectSummaryDto = {
  slug: string;
  name: string;
  category: string;
  city: string;
  drawingNo: string;
  plot: Plot;
  rooms: Pick<Room, "name" | "x" | "y" | "w" | "d">[];
  /** Square feet. */
  plotArea: number;
  coveredArea: number;
};

export const coveredArea = (rooms: Room[]) => rooms.reduce((sum, r) => sum + r.w * r.d, 0);

const toPlot = (r: Pick<ProjectRow, "plotWidth" | "plotDepth" | "roadWidth" | "setbackFront" | "setbackRear" | "setbackLeft" | "setbackRight">): Plot => ({
  width: r.plotWidth,
  depth: r.plotDepth,
  road: r.roadWidth,
  setbacks: { front: r.setbackFront, rear: r.setbackRear, left: r.setbackLeft, right: r.setbackRight },
});

export function toProjectDto(r: ProjectRow): ProjectDto {
  return {
    slug: r.slug,
    name: r.name,
    category: r.categoryId,
    city: r.city,
    society: r.society,
    client: r.client,
    plotNo: r.plotNo,
    floors: r.floors,
    drawingNo: r.drawingNo,
    scale: r.scale,
    date: r.date,
    status: r.status,
    plot: toPlot(r),
    // Written only through projectSchema, so the stored JSON has these shapes.
    rooms: r.rooms as Room[],
    openings: r.openings as Opening[],
  };
}

/** Columns a project card needs. Openings, the largest part of a project, are left out. */
export const summarySelect = {
  slug: true,
  name: true,
  categoryId: true,
  city: true,
  drawingNo: true,
  plotWidth: true,
  plotDepth: true,
  roadWidth: true,
  setbackFront: true,
  setbackRear: true,
  setbackLeft: true,
  setbackRight: true,
  rooms: true,
  coveredArea: true,
} satisfies Prisma.ProjectSelect;

export function toProjectSummaryDto(r: Prisma.ProjectGetPayload<{ select: typeof summarySelect }>): ProjectSummaryDto {
  const plot = toPlot(r);
  return {
    slug: r.slug,
    name: r.name,
    category: r.categoryId,
    city: r.city,
    drawingNo: r.drawingNo,
    plot,
    rooms: (r.rooms as Room[]).map(({ name, x, y, w, d }) => ({ name, x, y, w, d })),
    plotArea: plot.width * plot.depth,
    coveredArea: r.coveredArea,
  };
}

/** Columns for a create or update. */
export function toProjectData(p: ProjectInput) {
  return {
    slug: p.slug,
    name: p.name,
    city: p.city,
    society: p.society,
    client: p.client,
    plotNo: p.plotNo,
    floors: p.floors,
    drawingNo: p.drawingNo,
    scale: p.scale,
    date: p.date,
    status: p.status,
    plotWidth: p.plot.width,
    plotDepth: p.plot.depth,
    roadWidth: p.plot.road,
    setbackFront: p.plot.setbacks.front,
    setbackRear: p.plot.setbacks.rear,
    setbackLeft: p.plot.setbacks.left,
    setbackRight: p.plot.setbacks.right,
    rooms: p.rooms,
    openings: p.openings,
    coveredArea: coveredArea(p.rooms),
  };
}
