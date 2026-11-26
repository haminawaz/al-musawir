import type { Plot, Room } from "./types";

export const plotSize = ({ plot }: { plot: Plot }) => `${plot.width}' x ${plot.depth}'`;
export const plotArea = ({ plot }: { plot: Plot }) => plot.width * plot.depth;
export const coveredArea = ({ rooms }: { rooms: Pick<Room, "w" | "d">[] }) => rooms.reduce((sum, r) => sum + r.w * r.d, 0);
export const sqft = (n: number) => `${n.toLocaleString("en-US")} sq ft`;

/** A wa.me link to the business number, with an optional message filled in. */
export function whatsappLink(number: string, text?: string) {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Fills {name}-style placeholders, e.g. in the project page's WhatsApp message. */
export const fillTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
