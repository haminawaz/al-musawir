import { tones, type PlanTone } from "./styles";

export function Legend({ tone = "model" }: { tone?: PlanTone }) {
  const t = tones[tone];
  const items = [
    { label: "Plot boundary", className: t.plot, d: "M0,7H40" },
    { label: "Setback line", className: t.setback, d: "M0,7H40" },
    { label: "Outer wall", className: t.outerWall, d: "M0,7H40" },
    { label: "Inner wall", className: t.innerWall, d: "M0,7H40" },
    { label: "Door and swing", className: t.door, d: "M8,13V3A10,10,0,0,1,18,13" },
    { label: "Window", className: t.window, d: "M8,5H32M8,9H32M8,7H32" },
  ];

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 text-sm text-muted">
          <svg viewBox="0 0 40 14" width="40" height="14" aria-hidden="true" className="shrink-0">
            <path className={item.className} d={item.d} />
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
