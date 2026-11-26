import type { Project } from "./types";

// Same formulas the website uses for its area statement and project cards.
export const plotSize = (p: Project) => `${p.plot.width}' x ${p.plot.depth}'`;
export const plotArea = (p: Project) => p.plot.width * p.plot.depth;
export const coveredArea = (p: Project) => p.rooms.reduce((sum, r) => sum + r.w * r.d, 0);
export const coverage = (p: Project) => {
  const area = plotArea(p);
  return area > 0 ? Math.round((coveredArea(p) / area) * 100) : 0;
};
export const sqft = (n: number) => `${n.toLocaleString("en-US")} sq ft`;

/** A plan can be drawn once the plot has a size. */
export const canDraw = (p: Project) =>
  [p.plot.width, p.plot.depth].every((n) => Number.isFinite(n) && n > 0) &&
  [p.plot.setbacks.front, p.plot.setbacks.rear, p.plot.setbacks.left, p.plot.setbacks.right].every((n) => Number.isFinite(n));

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Next free drawing number in the AM-001 series. */
export function nextDrawingNo(projects: Project[]) {
  const max = projects.reduce((m, p) => {
    const n = /^AM-(\d+)$/.exec(p.drawingNo)?.[1];
    return n ? Math.max(m, Number(n)) : m;
  }, 0);
  return `AM-${String(max + 1).padStart(3, "0")}`;
}

/** `base`, or `base-2`, `base-3`... whichever is free. */
export function uniqueSlug(base: string, taken: string[]) {
  if (!taken.includes(base)) return base;
  let i = 2;
  while (taken.includes(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function emptyProject(categoryId: string, drawingNo: string): Project {
  return {
    slug: "",
    name: "",
    category: categoryId,
    city: "",
    society: "",
    client: "",
    plotNo: "",
    floors: "Ground + first",
    drawingNo,
    scale: "1:100",
    date: "",
    status: "Draft",
    plot: { width: 25, depth: 45, road: 30, setbacks: { front: 5, rear: 3, left: 0, right: 0 } },
    rooms: [],
    openings: [],
  };
}
