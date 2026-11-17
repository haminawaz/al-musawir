import { line } from "./styles";

const items = [
  { label: "Plot boundary", className: line.plot, d: "M0,7H40" },
  { label: "Setback line", className: line.setback, d: "M0,7H40" },
  { label: "Outer wall", className: line.outerWall, d: "M0,7H40" },
  { label: "Inner wall", className: line.innerWall, d: "M0,7H40" },
  { label: "Door and swing", className: line.door, d: "M8,13V3A10,10,0,0,1,18,13" },
  { label: "Window", className: line.window, d: "M8,5H32M8,9H32M8,7H32" },
];

export function Legend() {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3 text-[.95rem]">
          <svg viewBox="0 0 40 14" width="40" height="14" aria-hidden="true">
            <path className={item.className} d={item.d} />
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
