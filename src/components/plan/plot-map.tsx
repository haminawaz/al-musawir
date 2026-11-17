import type { Opening, Project } from "@/data/projects";
import { line, px, text } from "./styles";

// Sheet layout, in SVG px. The plot depth always fills 600px; the scale follows from that.
const MARGIN = 70;
const PLOT_DEPTH_PX = 600;
const SHEET_HEIGHT = 790;
const SHEET_RIGHT_SPACE = 90;

/** Full plot map: plot boundary, setbacks, rooms, doors, windows, dimensions, north arrow and scale bar. */
export function PlotMap({ project }: { project: Project }) {
  const { plot, rooms, openings } = project;
  const { front, rear, left, right } = plot.setbacks;

  const scale = PLOT_DEPTH_PX / plot.depth;
  const len = (ft: number) => px(ft * scale);
  const X = (ft: number) => px(MARGIN + ft * scale);
  const Y = (ft: number) => px(MARGIN + ft * scale);

  const p = { x: MARGIN, y: MARGIN, w: len(plot.width), h: PLOT_DEPTH_PX };
  const pRight = px(p.x + p.w);
  const pBottom = p.y + p.h;
  const b = {
    x: X(left),
    y: Y(rear),
    w: len(plot.width - left - right),
    h: len(plot.depth - front - rear),
  };
  const bRight = px(b.x + b.w);
  const bBottom = px(b.y + b.h);
  const midX = px(p.x + p.w / 2);
  const midY = p.y + p.h / 2;
  const sheetWidth = Math.round(p.x + p.w + SHEET_RIGHT_SPACE);
  const northX = px(pRight + 48);
  const tick = (ft: number) => px(MARGIN + len(ft));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${sheetWidth} ${SHEET_HEIGHT}`}
      role="img"
      aria-label={`Plot map of ${project.name}`}
      className="mx-auto block h-auto w-full max-w-[760px]"
    >
      <rect width="100%" height="100%" className="fill-white" />

      {/* Road along the front of the plot */}
      <rect x={px(p.x - len(8))} y={pBottom + 10} width={px(p.w + len(16))} height={38} className="fill-[#e4e4e0]" />
      <text className={text.road} x={midX} y={pBottom + 34} textAnchor="middle">
        {plot.road}&apos; wide road
      </text>

      {/* Plot boundary and setback line */}
      <rect className={line.plot} x={p.x} y={p.y} width={p.w} height={p.h} />
      <rect className={line.setback} x={b.x} y={b.y} width={b.w} height={b.h} />
      <text className={text.note} x={midX} y={px((bBottom + pBottom) / 2 + 3)} textAnchor="middle">
        Front setback {front}&apos;
      </text>
      <text className={text.note} x={midX} y={px((p.y + b.y) / 2 + 3)} textAnchor="middle">
        Rear setback {rear}&apos;
      </text>
      {left > 0 && (
        <text className={text.note} transform={`translate(${px((p.x + b.x) / 2 + 3)},${midY}) rotate(-90)`} textAnchor="middle">
          {left}&apos; side
        </text>
      )}
      {right > 0 && (
        <text className={text.note} transform={`translate(${px((bRight + pRight) / 2 + 3)},${midY}) rotate(-90)`} textAnchor="middle">
          {right}&apos; side
        </text>
      )}

      {/* Rooms */}
      {rooms.map((r) => {
        const x = X(r.x);
        const x2 = X(r.x + r.w);
        return (
          <g key={r.name}>
            <rect className={line.innerWall} x={x} y={Y(r.y)} width={len(r.w)} height={len(r.d)} />
            {r.stairs && (
              <path
                className={line.tread}
                d={Array.from({ length: r.d - 1 }, (_, i) => `M${x} ${Y(r.y + i + 1)}H${x2}`).join("")}
              />
            )}
          </g>
        );
      })}
      <rect className={line.outerWall} x={b.x} y={b.y} width={b.w} height={b.h} />

      {/* Doors and windows: first cut a gap in the wall, then draw the symbol */}
      {openings
        .filter((o) => o.entrance)
        .map((o) => (
          <text key={`entrance-${o.x}-${o.y}`} className={text.note} x={X(o.x)} y={px(Y(o.y) + 14)} textAnchor="middle">
            Entrance
          </text>
        ))}
      {openings.map((o) => {
        const h = len(o.width / 2);
        return (
          <line
            key={`gap-${o.x}-${o.y}`}
            transform={openingTransform(o, X, Y)}
            x1={-h}
            y1={0}
            x2={h}
            y2={0}
            className="stroke-white stroke-8"
          />
        );
      })}
      {openings.map((o) => {
        const h = len(o.width / 2);
        return (
          <path
            key={`symbol-${o.x}-${o.y}`}
            transform={openingTransform(o, X, Y)}
            d={o.type === "door" ? doorPath(h) : windowPath(h)}
            className={o.type === "door" ? line.door : line.window}
          />
        );
      })}

      {/* Room names and sizes */}
      {rooms.map((r) => {
        const size = r.label?.size ?? 11;
        const lx = X(r.label?.x ?? r.x + r.w / 2);
        const ly = Y(r.label?.y ?? r.y + r.d / 2);
        return (
          <g key={r.name}>
            <text className={text.roomName} fontSize={size} x={lx} y={ly} textAnchor="middle">
              {r.name}
            </text>
            <text className={text.roomSize} fontSize={size - 1} x={lx} y={px(ly + size + 2)} textAnchor="middle">
              {r.w}&apos; x {r.d}&apos;
            </text>
          </g>
        );
      })}

      {/* Overall dimensions */}
      <path className={line.dimension} d={`M${p.x} 40H${pRight}M${p.x} 35V45M${pRight} 35V45`} />
      <text className={text.dimension} x={midX} y={34} textAnchor="middle">
        {plot.width}&apos;-0&quot;
      </text>
      <path className={line.dimension} d={`M36 ${p.y}V${pBottom}M31 ${p.y}H41M31 ${pBottom}H41`} />
      <text className={text.dimension} x={30} y={midY} textAnchor="middle" transform={`rotate(-90 30 ${midY})`}>
        {plot.depth}&apos;-0&quot;
      </text>
      <path className={line.dimension} d={`M${b.x} 58H${bRight}M${b.x} 53V63M${bRight} 53V63`} />
      <text className={text.dimension} x={px(b.x + b.w / 2)} y={52} textAnchor="middle">
        {plot.width - left - right}&apos;
      </text>

      {/* North arrow */}
      <circle cx={northX} cy={104} r={18} className="fill-none stroke-[#222]" />
      <path d={`M${northX} 88L${px(northX + 7)} 116L${northX} 110L${px(northX - 7)} 116Z`} className="fill-[#222]" />
      <text className={text.dimension} x={northX} y={80} textAnchor="middle">
        N
      </text>

      {/* Scale bar: 0, 5 and 10 ft */}
      <path className={line.dimension} d={`M${MARGIN} 754H${tick(10)}M${MARGIN} 749V759M${tick(5)} 749V759M${tick(10)} 749V759`} />
      <text className={text.note} x={MARGIN} y={772}>
        0
      </text>
      <text className={text.note} x={tick(5)} y={772} textAnchor="middle">
        5
      </text>
      <text className={text.note} x={tick(10)} y={772} textAnchor="middle">
        10 ft
      </text>
      <text className={text.dimension} x={tick(14)} y={758}>
        Scale {project.scale}
      </text>
    </svg>
  );
}

function openingTransform(o: Opening, X: (ft: number) => number, Y: (ft: number) => number) {
  return `translate(${X(o.x)},${Y(o.y)}) rotate(${o.rotate})`;
}

/** Door leaf and quarter-circle swing; the door is as deep as it is wide. */
function doorPath(h: number) {
  const r = px(h * 2);
  return `M${-h} ${-r}A${r} ${r} 0 0 1 ${h} 0M${-h} 0V${-r}`;
}

/** Window: three parallel lines across the wall. */
function windowPath(h: number) {
  return `M${-h} -2.2H${h}M${-h} 2.2H${h}M${-h} 0H${h}`;
}
