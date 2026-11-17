export type Category = "5-marla" | "10-marla" | "1-kanal" | "commercial";

export const categories: { id: Category; label: string }[] = [
  { id: "5-marla", label: "5 Marla" },
  { id: "10-marla", label: "10 Marla" },
  { id: "1-kanal", label: "1 Kanal" },
  { id: "commercial", label: "Commercial" },
];

/**
 * All plan geometry is in feet. The origin is the rear-left corner of the plot:
 * x runs across the plot, y runs from the rear towards the road at the front.
 */
export type Room = {
  name: string;
  /** Top-left corner of the room. */
  x: number;
  y: number;
  /** Clear internal size: w across the plot, d from rear to front. */
  w: number;
  d: number;
  /** Draws stair treads, one per foot. */
  stairs?: boolean;
  /** Baseline of the room name on the plot map. Defaults to the room centre; size is in px (default 11). */
  label?: { x: number; y: number; size?: number };
};

export type Opening = {
  type: "door" | "window";
  /** Centre of the opening, on a wall line. */
  x: number;
  y: number;
  /** 0 = wall runs across the plot. 90 / -90 = wall runs front to back. Doors swing towards -y before rotation. */
  rotate: 0 | 90 | 180 | -90;
  width: number;
  /** Labels this door "Entrance" on the plot map. */
  entrance?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  category: Category;
  city: string;
  society: string;
  client: string;
  plotNo: string;
  floors: string;
  drawingNo: string;
  scale: string;
  date: string;
  status: string;
  plot: {
    width: number;
    depth: number;
    road: number;
    setbacks: { front: number; rear: number; left: number; right: number };
  };
  rooms: Room[];
  openings: Opening[];
};

export const projects: Project[] = [
  {
    slug: "family-house-5-marla",
    name: "Family house, 5 Marla",
    category: "5-marla",
    city: "Lahore",
    society: "placeholder society",
    client: "Placeholder name",
    plotNo: "Placeholder",
    floors: "Ground + first",
    drawingNo: "AM-001",
    scale: "1:100 (sample)",
    date: "Placeholder",
    status: "Sample drawing",
    plot: {
      width: 25,
      depth: 45,
      road: 30,
      setbacks: { front: 5, rear: 3, left: 0, right: 0 },
    },
    rooms: [
      { name: "Bedroom 1", x: 0, y: 3, w: 12, d: 12, label: { x: 6, y: 8.42 } },
      { name: "Bath", x: 12, y: 3, w: 6, d: 7, label: { x: 17, y: 6.99 } },
      { name: "Kitchen", x: 18, y: 3, w: 7, d: 12, label: { x: 21.5, y: 8.42 } },
      { name: "Stairs", x: 12, y: 10, w: 6, d: 10, stairs: true, label: { x: 15, y: 13.43 } },
      { name: "Lounge", x: 0, y: 15, w: 12, d: 12, label: { x: 5.84, y: 20.87 } },
      { name: "Dining", x: 18, y: 15, w: 7, d: 12, label: { x: 23.64, y: 19.7 } },
      { name: "Passage", x: 12, y: 20, w: 6, d: 7, label: { x: 16.06, y: 21.13 } },
      { name: "Drawing room", x: 0, y: 27, w: 15, d: 13, label: { x: 7.5, y: 33.43 } },
      { name: "Bedroom 2", x: 15, y: 27, w: 10, d: 13, label: { x: 20, y: 33.43 } },
    ],
    openings: [
      { type: "door", x: 6, y: 15, rotate: 0, width: 3 },
      { type: "window", x: 6, y: 3, rotate: 0, width: 4 },
      { type: "window", x: 0, y: 9, rotate: 90, width: 4 },
      { type: "door", x: 12, y: 6, rotate: 90, width: 3 },
      { type: "window", x: 15, y: 3, rotate: 0, width: 3 },
      { type: "door", x: 21.5, y: 15, rotate: 0, width: 3 },
      { type: "window", x: 21.5, y: 3, rotate: 0, width: 3 },
      { type: "window", x: 25, y: 9, rotate: 90, width: 4 },
      { type: "door", x: 15, y: 20, rotate: 0, width: 3 },
      { type: "door", x: 12, y: 23, rotate: -90, width: 3 },
      { type: "window", x: 0, y: 21, rotate: 90, width: 4 },
      { type: "door", x: 18, y: 23, rotate: 90, width: 3 },
      { type: "window", x: 25, y: 21, rotate: 90, width: 4 },
      { type: "door", x: 13.5, y: 27, rotate: 0, width: 3 },
      { type: "door", x: 6, y: 27, rotate: 180, width: 3 },
      { type: "window", x: 0, y: 33.5, rotate: 90, width: 4 },
      { type: "door", x: 20, y: 27, rotate: 180, width: 3 },
      { type: "window", x: 20, y: 40, rotate: 0, width: 4 },
      { type: "window", x: 25, y: 33.5, rotate: 90, width: 4 },
      { type: "door", x: 7.5, y: 40, rotate: 0, width: 3.5, entrance: true },
    ],
  },
  {
    slug: "family-house-10-marla",
    name: "Family house, 10 Marla",
    category: "10-marla",
    city: "Islamabad",
    society: "placeholder society",
    client: "Placeholder name",
    plotNo: "Placeholder",
    floors: "Ground + first",
    drawingNo: "AM-002",
    scale: "1:100 (sample)",
    date: "Placeholder",
    status: "Sample drawing",
    plot: {
      width: 35,
      depth: 65,
      road: 40,
      setbacks: { front: 8, rear: 5, left: 3, right: 3 },
    },
    rooms: [
      { name: "Bedroom A", x: 3, y: 5, w: 14, d: 16, label: { x: 10, y: 12.89 } },
      { name: "Bath", x: 17, y: 5, w: 6, d: 8, label: { x: 22, y: 8.89, size: 8 } },
      { name: "Stairs", x: 17, y: 13, w: 6, d: 8, stairs: true, label: { x: 20, y: 14.39, size: 8 } },
      { name: "Bedroom B", x: 23, y: 5, w: 9, d: 16, label: { x: 27.5, y: 12.89 } },
      { name: "Kitchen", x: 3, y: 21, w: 10, d: 16, label: { x: 6.5, y: 28.89 } },
      { name: "Dining", x: 13, y: 21, w: 19, d: 16, label: { x: 22.5, y: 28.89 } },
      { name: "Lounge", x: 3, y: 37, w: 16, d: 20, label: { x: 11, y: 46.89 } },
      { name: "Drawing room", x: 19, y: 37, w: 13, d: 20, label: { x: 25.5, y: 46.89 } },
    ],
    openings: [
      { type: "door", x: 15, y: 21, rotate: 0, width: 3 },
      { type: "window", x: 10, y: 5, rotate: 0, width: 4 },
      { type: "window", x: 3, y: 13, rotate: 90, width: 4 },
      { type: "door", x: 17, y: 9, rotate: 90, width: 3 },
      { type: "window", x: 20, y: 5, rotate: 0, width: 3 },
      { type: "door", x: 20, y: 21, rotate: 0, width: 3 },
      { type: "door", x: 27.5, y: 21, rotate: 0, width: 3 },
      { type: "window", x: 27.5, y: 5, rotate: 0, width: 3 },
      { type: "window", x: 32, y: 13, rotate: 90, width: 4 },
      { type: "door", x: 13, y: 29, rotate: -90, width: 3 },
      { type: "window", x: 3, y: 29, rotate: 90, width: 4 },
      { type: "window", x: 32, y: 29, rotate: 90, width: 4 },
      { type: "door", x: 15, y: 37, rotate: 180, width: 3 },
      { type: "window", x: 3, y: 47, rotate: 90, width: 4 },
      { type: "door", x: 25.5, y: 37, rotate: 180, width: 3 },
      { type: "window", x: 25.5, y: 57, rotate: 0, width: 4 },
      { type: "window", x: 32, y: 47, rotate: 90, width: 4 },
      { type: "door", x: 11, y: 57, rotate: 0, width: 3.5, entrance: true },
    ],
  },
  {
    slug: "residence-1-kanal",
    name: "Residence, 1 Kanal",
    category: "1-kanal",
    city: "Rawalpindi",
    society: "placeholder society",
    client: "Placeholder name",
    plotNo: "Placeholder",
    floors: "Ground + first",
    drawingNo: "AM-003",
    scale: "1:100 (sample)",
    date: "Placeholder",
    status: "Sample drawing",
    plot: {
      width: 50,
      depth: 90,
      road: 50,
      setbacks: { front: 15, rear: 8, left: 5, right: 5 },
    },
    rooms: [
      { name: "Bedroom 1", x: 5, y: 8, w: 16, d: 20, label: { x: 13, y: 17.85, size: 9 } },
      { name: "Bath", x: 21, y: 8, w: 8, d: 10, label: { x: 25, y: 11.35, size: 6 } },
      { name: "Dress", x: 21, y: 18, w: 8, d: 10, label: { x: 25, y: 21.35, size: 6 } },
      { name: "Bedroom 2", x: 29, y: 8, w: 16, d: 20, label: { x: 37, y: 17.85, size: 9 } },
      { name: "Kitchen", x: 5, y: 28, w: 12, d: 22, label: { x: 10.5, y: 38.85, size: 9 } },
      { name: "Dining", x: 17, y: 28, w: 16, d: 22, label: { x: 25, y: 38.85, size: 9 } },
      { name: "Stairs", x: 33, y: 28, w: 12, d: 12, stairs: true, label: { x: 39.49, y: 33.85, size: 9 } },
      { name: "Store", x: 33, y: 40, w: 12, d: 10, label: { x: 39.49, y: 44.85, size: 9 } },
      { name: "Drawing room", x: 5, y: 50, w: 18, d: 25, label: { x: 14, y: 62.36, size: 9 } },
      { name: "Lounge", x: 23, y: 50, w: 22, d: 25, label: { x: 34, y: 62.36, size: 9 } },
    ],
    openings: [
      { type: "door", x: 21, y: 13, rotate: -90, width: 3 },
      { type: "door", x: 19, y: 28, rotate: 0, width: 3 },
      { type: "window", x: 13, y: 8, rotate: 0, width: 4 },
      { type: "window", x: 5, y: 18, rotate: 90, width: 4 },
      { type: "door", x: 25, y: 18, rotate: 0, width: 3 },
      { type: "window", x: 25, y: 8, rotate: 0, width: 3 },
      { type: "door", x: 25, y: 28, rotate: 0, width: 3 },
      { type: "door", x: 31.5, y: 28, rotate: 0, width: 3 },
      { type: "window", x: 37, y: 8, rotate: 0, width: 4 },
      { type: "window", x: 45, y: 18, rotate: 90, width: 4 },
      { type: "door", x: 17, y: 39, rotate: -90, width: 3 },
      { type: "window", x: 5, y: 39, rotate: 90, width: 4 },
      { type: "door", x: 33, y: 34, rotate: 90, width: 3 },
      { type: "window", x: 45, y: 34, rotate: 90, width: 4 },
      { type: "door", x: 33, y: 45, rotate: 90, width: 3 },
      { type: "door", x: 20, y: 50, rotate: 180, width: 3 },
      { type: "window", x: 14, y: 75, rotate: 0, width: 4 },
      { type: "window", x: 5, y: 62.5, rotate: 90, width: 4 },
      { type: "door", x: 28, y: 50, rotate: 180, width: 3 },
      { type: "window", x: 45, y: 62.5, rotate: 90, width: 4 },
      { type: "door", x: 34, y: 75, rotate: 0, width: 3.5, entrance: true },
    ],
  },
  {
    slug: "shop-and-office-block",
    name: "Shop and office block",
    category: "commercial",
    city: "Abbottabad",
    society: "placeholder society",
    client: "Placeholder name",
    plotNo: "Placeholder",
    floors: "Ground + 2",
    drawingNo: "AM-004",
    scale: "1:100 (sample)",
    date: "Placeholder",
    status: "Sample drawing",
    plot: {
      width: 30,
      depth: 60,
      road: 40,
      setbacks: { front: 10, rear: 5, left: 0, right: 0 },
    },
    rooms: [
      { name: "Stairs", x: 0, y: 5, w: 8, d: 17, stairs: true, label: { x: 4, y: 13.4 } },
      { name: "WC", x: 8, y: 5, w: 7, d: 10, label: { x: 11.5, y: 8.4 } },
      { name: "Passage", x: 8, y: 15, w: 7, d: 7, label: { x: 11.5, y: 16.1 } },
      { name: "Office hall", x: 15, y: 5, w: 15, d: 17, label: { x: 22.5, y: 13.4 } },
      { name: "Store 1", x: 0, y: 22, w: 15, d: 14, label: { x: 7.5, y: 28.9 } },
      { name: "Store 2", x: 15, y: 22, w: 15, d: 14, label: { x: 22.5, y: 28.9 } },
      { name: "Shop 1", x: 0, y: 36, w: 15, d: 14, label: { x: 7.5, y: 42.9 } },
      { name: "Shop 2", x: 15, y: 36, w: 15, d: 14, label: { x: 22.5, y: 42.9 } },
    ],
    openings: [
      { type: "door", x: 4, y: 22, rotate: 0, width: 3 },
      { type: "window", x: 4, y: 5, rotate: 0, width: 3 },
      { type: "window", x: 0, y: 13.5, rotate: 90, width: 4 },
      { type: "door", x: 11.5, y: 15, rotate: 0, width: 3 },
      { type: "window", x: 11.5, y: 5, rotate: 0, width: 3 },
      { type: "door", x: 11.5, y: 22, rotate: 0, width: 3 },
      { type: "door", x: 22.5, y: 22, rotate: 0, width: 3 },
      { type: "window", x: 22.5, y: 5, rotate: 0, width: 4 },
      { type: "window", x: 30, y: 13.5, rotate: 90, width: 4 },
      { type: "door", x: 7.5, y: 36, rotate: 0, width: 3 },
      { type: "door", x: 22.5, y: 36, rotate: 0, width: 3 },
      { type: "door", x: 7.5, y: 50, rotate: 0, width: 3 },
      { type: "window", x: 0, y: 43, rotate: 90, width: 4 },
      { type: "door", x: 22.5, y: 50, rotate: 0, width: 3 },
      { type: "window", x: 30, y: 43, rotate: 90, width: 4 },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const plotSize = (p: Project) => `${p.plot.width}' x ${p.plot.depth}'`;
export const plotArea = (p: Project) => p.plot.width * p.plot.depth;
export const coveredArea = (p: Project) => p.rooms.reduce((sum, r) => sum + r.w * r.d, 0);
export const sqft = (n: number) => `${n.toLocaleString("en-US")} sq ft`;
