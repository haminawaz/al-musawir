import type { Project } from "@/data/projects";
import { line, px } from "./styles";

const PAD_Y = 14;

/** Small plan: plot boundary, rooms and outer wall, scaled to fit the given box. */
export function PlanThumb({
  project,
  width = 260,
  height = 220,
  className = "max-h-[430px]",
}: {
  project: Project;
  width?: number;
  height?: number;
  className?: string;
}) {
  const { plot, rooms } = project;
  const { front, rear, left, right } = plot.setbacks;
  const scale = (height - PAD_Y * 2) / plot.depth;
  const plotW = plot.width * scale;
  const ox = (width - plotW) / 2;
  const X = (ft: number) => px(ox + ft * scale);
  const Y = (ft: number) => px(PAD_Y + ft * scale);
  const len = (ft: number) => px(ft * scale);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Plan thumbnail of ${project.name}`}
      className={`block h-auto w-full ${className}`}
    >
      <rect className={line.plot} x={px(ox)} y={PAD_Y} width={px(plotW)} height={height - PAD_Y * 2} />
      {rooms.map((r) => (
        <rect key={r.name} className={line.innerWall} x={X(r.x)} y={Y(r.y)} width={len(r.w)} height={len(r.d)} />
      ))}
      <rect
        className={line.outerWall}
        x={X(left)}
        y={Y(rear)}
        width={len(plot.width - left - right)}
        height={len(plot.depth - front - rear)}
      />
    </svg>
  );
}
