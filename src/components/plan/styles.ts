// Line and text styles shared by every plan drawing (plot map, thumbnails, legend, survey sketch).
export const line = {
  plot: "fill-none stroke-[#777] stroke-[1.5] [stroke-dasharray:8_4]",
  setback: "fill-none stroke-[#aaa] stroke-1 [stroke-dasharray:2_3]",
  outerWall: "fill-none stroke-ink stroke-5",
  innerWall: "fill-white stroke-ink stroke-2",
  door: "fill-none stroke-ink stroke-[1.2]",
  window: "fill-none stroke-ink stroke-[0.9]",
  tread: "fill-none stroke-[#555] stroke-[0.8]",
  dimension: "fill-none stroke-[#444] stroke-1",
};

export const text = {
  dimension: "font-sans text-[12px] font-semibold fill-[#222]",
  note: "font-sans text-[10px] font-medium fill-[#777]",
  road: "font-sans text-[13px] font-semibold fill-[#555]",
  roomName: "font-sans font-semibold fill-ink",
  roomSize: "font-sans fill-muted",
};

/** Round to 0.1 px so the SVG markup stays short. */
export const px = (n: number) => Math.round(n * 10) / 10;
