// Copied from the website (App/src/components/plan) so the dashboard draws plans the same way.
// Line and text styles for plan drawings, in two tones:
// "paper" = black linework on a white sheet (project plot maps, printing),
// "model" = light linework on the dark canvas, like CAD model space (hero, thumbnails, legend).
export type PlanTone = "paper" | "model";

export const tones = {
  paper: {
    background: "fill-white",
    road: "fill-[#e4e4e0]",
    roadText: "font-sans text-[13px] font-semibold fill-[#555]",
    plot: "fill-none stroke-[#777] stroke-[1.5] [stroke-dasharray:8_4]",
    setback: "fill-none stroke-[#aaa] stroke-1 [stroke-dasharray:2_3]",
    outerWall: "fill-none stroke-paper-ink stroke-5",
    innerWall: "fill-white stroke-paper-ink stroke-2",
    gap: "stroke-white stroke-8",
    door: "fill-none stroke-paper-ink stroke-[1.2]",
    window: "fill-none stroke-paper-ink stroke-[0.9]",
    tread: "fill-none stroke-[#555] stroke-[0.8]",
    dimension: "fill-none stroke-[#444] stroke-1",
    dimensionText: "font-sans text-[12px] font-semibold fill-[#222]",
    note: "font-sans text-[10px] font-medium fill-[#777]",
    roomName: "font-sans font-semibold fill-paper-ink",
    roomSize: "font-sans fill-[#666]",
    north: "fill-none stroke-[#222]",
    northArrow: "fill-[#222]",
  },
  model: {
    background: "fill-none",
    road: "fill-raised",
    roadText: "font-mono text-[11px] font-medium fill-subtle",
    plot: "fill-none stroke-subtle stroke-[1.5] [stroke-dasharray:8_4]",
    setback: "fill-none stroke-line-strong stroke-1 [stroke-dasharray:2_3]",
    outerWall: "fill-none stroke-fg stroke-5",
    innerWall: "fill-none stroke-fg/75 stroke-2",
    gap: "stroke-surface stroke-8",
    door: "fill-none stroke-muted stroke-[1.2]",
    window: "fill-none stroke-muted stroke-[0.9]",
    tread: "fill-none stroke-subtle stroke-[0.8]",
    dimension: "fill-none stroke-accent/80 stroke-1",
    dimensionText: "font-mono text-[11px] font-medium fill-accent",
    note: "font-mono text-[9px] fill-subtle",
    roomName: "font-sans font-semibold fill-fg",
    roomSize: "font-mono fill-muted",
    north: "fill-none stroke-accent/80",
    northArrow: "fill-accent",
  },
} satisfies Record<PlanTone, Record<string, string>>;

/** Round to 0.1 px so the SVG markup stays short. */
export const px = (n: number) => Math.round(n * 10) / 10;
