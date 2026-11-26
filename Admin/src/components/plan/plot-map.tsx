import type { Opening, Project } from "@/lib/types";
import { px, tones, type PlanTone } from "./styles";

// Same drawing as the website's PlotMap (App/src/components/plan/plot-map.tsx), for the live preview
// in the project editor. Differences: no draw-in animation, items keyed by position in the list
// (names can repeat while someone is typing), and `highlight` marks the room or opening being edited.

const MARGIN = 70;
const PLOT_DEPTH_PX = 600;
const SHEET_HEIGHT = 790;
const SHEET_RIGHT_SPACE = 90;

export type PlanHighlight = { kind: "room" | "opening"; index: number } | null;

const finite = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);

export function PlotMap({
  project,
  tone = "paper",
  highlight = null,
  className = "mx-auto block h-auto w-full",
}: {
  project: Project;
  tone?: PlanTone;
  highlight?: PlanHighlight;
  className?: string;
}) {
  const { plot } = project;
  const front = finite(plot.setbacks.front);
  const rear = finite(plot.setbacks.rear);
  const left = finite(plot.setbacks.left);
  const right = finite(plot.setbacks.right);
  // Skip rows that are half typed, rather than drawing NaN.
  const rooms = project.rooms
    .map((r, index) => ({ ...r, index }))
    .filter((r) => [r.x, r.y, r.w, r.d].every(Number.isFinite));
  const openings = project.openings
    .map((o, index) => ({ ...o, index }))
    .filter((o) => [o.x, o.y, o.width].every(Number.isFinite));
  const t = tones[tone];

  const scale = PLOT_DEPTH_PX / plot.depth;
  const len = (ft: number) => px(ft * scale);
  const X = (ft: number) => px(MARGIN + ft * scale);
  const Y = (ft: number) => px(MARGIN + ft * scale);

  const p = { x: MARGIN, y: MARGIN, w: len(plot.width), h: PLOT_DEPTH_PX };
  const pRight = px(p.x + p.w);
  const pBottom = p.y + p.h;
  const b = { x: X(left), y: Y(rear), w: len(plot.width - left - right), h: len(plot.depth - front - rear) };
  const bRight = px(b.x + b.w);
  const bBottom = px(b.y + b.h);
  const midX = px(p.x + p.w / 2);
  const midY = p.y + p.h / 2;
  const sheetWidth = Math.round(p.x + p.w + SHEET_RIGHT_SPACE);
  const northX = px(pRight + 48);
  const tick = (ft: number) => px(MARGIN + len(ft));

  const hlRoom = highlight?.kind === "room" ? rooms.find((r) => r.index === highlight.index) : undefined;
  const hlOpening = highlight?.kind === "opening" ? openings.find((o) => o.index === highlight.index) : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${sheetWidth} ${SHEET_HEIGHT}`}
      role="img"
      aria-label={`Plot map of ${project.name || "the project"}`}
      className={className}
    >
      <rect width="100%" height="100%" className={t.background} />

      <rect x={px(p.x - len(8))} y={pBottom + 10} width={Math.max(0, px(p.w + len(16)))} height={38} className={t.road} />
      <text className={t.roadText} x={midX} y={pBottom + 34} textAnchor="middle">
        {plot.road}&apos; wide road
      </text>

      <rect className={t.plot} x={p.x} y={p.y} width={p.w} height={p.h} />
      <rect className={t.setback} x={b.x} y={b.y} width={Math.max(0, b.w)} height={Math.max(0, b.h)} />
      <text className={t.note} x={midX} y={px((bBottom + pBottom) / 2 + 3)} textAnchor="middle">
        Front setback {front}&apos;
      </text>
      <text className={t.note} x={midX} y={px((p.y + b.y) / 2 + 3)} textAnchor="middle">
        Rear setback {rear}&apos;
      </text>
      {left > 0 && (
        <text className={t.note} transform={`translate(${px((p.x + b.x) / 2 + 3)},${midY}) rotate(-90)`} textAnchor="middle">
          {left}&apos; side
        </text>
      )}
      {right > 0 && (
        <text className={t.note} transform={`translate(${px((bRight + pRight) / 2 + 3)},${midY}) rotate(-90)`} textAnchor="middle">
          {right}&apos; side
        </text>
      )}

      {rooms.map((r) => {
        const x = X(r.x);
        const x2 = X(r.x + r.w);
        const treads = r.stairs ? Math.max(0, Math.min(Math.floor(r.d) - 1, 200)) : 0;
        return (
          <g key={r.index}>
            <rect className={t.innerWall} x={x} y={Y(r.y)} width={Math.max(0, len(r.w))} height={Math.max(0, len(r.d))} />
            {treads > 0 && (
              <path
                className={t.tread}
                d={Array.from({ length: treads }, (_, k) => `M${x} ${Y(r.y + k + 1)}H${x2}`).join("")}
              />
            )}
          </g>
        );
      })}
      <rect className={t.outerWall} x={b.x} y={b.y} width={Math.max(0, b.w)} height={Math.max(0, b.h)} />

      {openings
        .filter((o) => o.entrance)
        .map((o) => (
          <text key={`entrance-${o.index}`} className={t.note} x={X(o.x)} y={px(Y(o.y) + 14)} textAnchor="middle">
            Entrance
          </text>
        ))}
      {openings.map((o) => {
        const h = len(o.width / 2);
        return (
          <line key={`gap-${o.index}`} transform={openingTransform(o, X, Y)} x1={-h} y1={0} x2={h} y2={0} className={t.gap} />
        );
      })}
      {openings.map((o) => {
        const h = len(o.width / 2);
        return (
          <path
            key={`symbol-${o.index}`}
            transform={openingTransform(o, X, Y)}
            d={o.type === "door" ? doorPath(h) : windowPath(h)}
            className={o.type === "door" ? t.door : t.window}
          />
        );
      })}

      {rooms.map((r) => {
        const size = finite(r.label?.size ?? 11, 11);
        const lx = X(finite(r.label?.x ?? r.x + r.w / 2, r.x + r.w / 2));
        const ly = Y(finite(r.label?.y ?? r.y + r.d / 2, r.y + r.d / 2));
        return (
          <g key={`label-${r.index}`}>
            <text className={t.roomName} fontSize={size} x={lx} y={ly} textAnchor="middle">
              {r.name}
            </text>
            <text className={t.roomSize} fontSize={size - 1} x={lx} y={px(ly + size + 2)} textAnchor="middle">
              {r.w}&apos; x {r.d}&apos;
            </text>
          </g>
        );
      })}

      <path className={t.dimension} d={`M${p.x} 40H${pRight}M${p.x} 35V45M${pRight} 35V45`} />
      <text className={t.dimensionText} x={midX} y={34} textAnchor="middle">
        {plot.width}&apos;-0&quot;
      </text>
      <path className={t.dimension} d={`M36 ${p.y}V${pBottom}M31 ${p.y}H41M31 ${pBottom}H41`} />
      <text className={t.dimensionText} x={30} y={midY} textAnchor="middle" transform={`rotate(-90 30 ${midY})`}>
        {plot.depth}&apos;-0&quot;
      </text>
      <path className={t.dimension} d={`M${b.x} 58H${bRight}M${b.x} 53V63M${bRight} 53V63`} />
      <text className={t.dimensionText} x={px(b.x + b.w / 2)} y={52} textAnchor="middle">
        {plot.width - left - right}&apos;
      </text>

      <circle cx={northX} cy={104} r={18} className={t.north} />
      <path d={`M${northX} 88L${px(northX + 7)} 116L${northX} 110L${px(northX - 7)} 116Z`} className={t.northArrow} />
      <text className={t.dimensionText} x={northX} y={80} textAnchor="middle">
        N
      </text>

      <path
        className={t.dimension}
        d={`M${MARGIN} 754H${tick(10)}M${MARGIN} 749V759M${tick(5)} 749V759M${tick(10)} 749V759`}
      />
      <text className={t.note} x={MARGIN} y={772}>
        0
      </text>
      <text className={t.note} x={tick(5)} y={772} textAnchor="middle">
        5
      </text>
      <text className={t.note} x={tick(10)} y={772} textAnchor="middle">
        10 ft
      </text>
      <text className={t.dimensionText} x={tick(14)} y={758}>
        Scale {project.scale}
      </text>

      {/* The row being edited */}
      {hlRoom && (
        <rect
          x={X(hlRoom.x)}
          y={Y(hlRoom.y)}
          width={Math.max(0, len(hlRoom.w))}
          height={Math.max(0, len(hlRoom.d))}
          className="pointer-events-none fill-[#e5ae4b]/25 stroke-[#c98a16] stroke-2"
        />
      )}
      {hlOpening && (
        <circle
          cx={X(hlOpening.x)}
          cy={Y(hlOpening.y)}
          r={Math.max(10, len(hlOpening.width / 2) + 6)}
          className="pointer-events-none fill-[#e5ae4b]/25 stroke-[#c98a16] stroke-2"
        />
      )}
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
