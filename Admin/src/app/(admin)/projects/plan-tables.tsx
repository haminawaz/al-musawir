"use client";

import { Copy, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PlanHighlight } from "@/components/plan/plot-map";
import { Button } from "@/components/ui/button";
import { cellInputClass, NumberInput } from "@/components/ui/field";
import { listOps } from "@/lib/hooks";
import type { Opening, OpeningRotation, Project, Room } from "@/lib/types";

type Props = {
  project: Project;
  onChange: (fn: (p: Project) => Project) => void;
  onHighlight: (h: PlanHighlight) => void;
};

const th = "px-2 py-2 text-left font-mono text-[0.62rem] font-normal tracking-widest text-subtle uppercase";
const td = "px-1 py-1 align-middle";
const iconButton =
  "grid size-7 cursor-pointer place-items-center rounded-md text-subtle transition hover:bg-raised hover:text-fg";

function RowActions({ label, onDuplicate, onRemove, extra }: { label: string; onDuplicate: () => void; onRemove: () => void; extra?: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-0.5">
      {extra}
      <button type="button" onClick={onDuplicate} className={iconButton} title="Duplicate">
        <Copy className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Duplicate {label}</span>
      </button>
      <button type="button" onClick={onRemove} className={`${iconButton} hover:text-danger`} title="Remove">
        <Trash2 className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Remove {label}</span>
      </button>
    </div>
  );
}

export function RoomsTable({ project, onChange, onHighlight }: Props) {
  const [labelsOpen, setLabelsOpen] = useState<number | null>(null);
  const rooms = project.rooms;

  const setRoom = (i: number, room: Room) => onChange((p) => ({ ...p, rooms: listOps.replace(p.rooms, i, room) }));
  const setNum = (i: number, key: "x" | "y" | "w" | "d") => (n: number | undefined) =>
    setRoom(i, { ...rooms[i], [key]: n ?? NaN });
  const setLabel = (i: number, key: "x" | "y" | "size") => (n: number | undefined) => {
    const next = { ...rooms[i].label, [key]: n } as Partial<NonNullable<Room["label"]>>;
    if (next.size === undefined) delete next.size;
    const room = { ...rooms[i] };
    if (next.x === undefined && next.y === undefined && next.size === undefined) delete room.label;
    else room.label = next as NonNullable<Room["label"]>;
    setRoom(i, room);
  };

  function add() {
    const { setbacks } = project.plot;
    onChange((p) => ({
      ...p,
      rooms: [...p.rooms, { name: `Room ${p.rooms.length + 1}`, x: setbacks.left || 0, y: setbacks.rear || 0, w: 10, d: 10 }],
    }));
  }

  return (
    <div>
      {rooms.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
          No rooms yet. Add the first one; it appears on the plan as you type.
        </p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm" onMouseLeave={() => onHighlight(null)}>
            <thead>
              <tr className="border-b border-line">
                <th className={`${th} w-[36%]`}>Room</th>
                <th className={th}>X</th>
                <th className={th}>Y</th>
                <th className={th}>Width</th>
                <th className={th}>Depth</th>
                <th className={`${th} text-center`}>Stairs</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r, i) => (
                <RoomRow
                  key={i}
                  room={r}
                  index={i}
                  labelsOpen={labelsOpen === i}
                  onToggleLabels={() => setLabelsOpen((o) => (o === i ? null : i))}
                  onHighlight={onHighlight}
                  setRoom={setRoom}
                  setNum={setNum}
                  setLabel={setLabel}
                  onDuplicate={() =>
                    onChange((p) => ({ ...p, rooms: listOps.insert(p.rooms, i + 1, { ...structuredClone(r), name: `${r.name} copy` }) }))
                  }
                  onRemove={() => {
                    setLabelsOpen(null);
                    onHighlight(null);
                    onChange((p) => ({ ...p, rooms: listOps.remove(p.rooms, i) }));
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Button variant="secondary" size="sm" onClick={add} className="mt-4">
        <Plus className="size-3.5" aria-hidden="true" />
        Add room
      </Button>
    </div>
  );
}

function RoomRow({
  room: r,
  index: i,
  labelsOpen,
  onToggleLabels,
  onHighlight,
  setRoom,
  setNum,
  setLabel,
  onDuplicate,
  onRemove,
}: {
  room: Room;
  index: number;
  labelsOpen: boolean;
  onToggleLabels: () => void;
  onHighlight: (h: PlanHighlight) => void;
  setRoom: (i: number, room: Room) => void;
  setNum: (i: number, key: "x" | "y" | "w" | "d") => (n: number | undefined) => void;
  setLabel: (i: number, key: "x" | "y" | "size") => (n: number | undefined) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const name = r.name || `Room ${i + 1}`;
  const highlight = () => onHighlight({ kind: "room", index: i });
  return (
    <>
      <tr className="border-b border-line transition-colors hover:bg-raised/50" onMouseEnter={highlight} onFocus={highlight}>
        <td className={td}>
          <input
            value={r.name}
            onChange={(e) => setRoom(i, { ...r, name: e.target.value })}
            aria-label={`Room ${i + 1} name`}
            aria-invalid={!r.name.trim() || undefined}
            className={cellInputClass}
          />
        </td>
        {(["x", "y", "w", "d"] as const).map((k) => (
          <td key={k} className={`${td} w-[11%]`}>
            <NumberInput value={r[k]} onChange={setNum(i, k)} aria-label={`${name} ${k === "w" ? "width" : k === "d" ? "depth" : k.toUpperCase()} in feet`} />
          </td>
        ))}
        <td className={`${td} text-center`}>
          <input
            type="checkbox"
            checked={!!r.stairs}
            onChange={(e) => {
              const room = { ...r };
              if (e.target.checked) room.stairs = true;
              else delete room.stairs;
              setRoom(i, room);
            }}
            aria-label={`${name} has stairs`}
            className="size-4 cursor-pointer accent-accent"
          />
        </td>
        <td className={td}>
          <RowActions
            label={name}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
            extra={
              <button
                type="button"
                onClick={onToggleLabels}
                aria-expanded={labelsOpen}
                className={`${iconButton} ${r.label ? "text-accent" : ""}`}
                title="Name position on the plan"
              >
                <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Name position for {name}</span>
              </button>
            }
          />
        </td>
      </tr>
      {labelsOpen && (
        <tr className="border-b border-line bg-raised/40" onMouseEnter={highlight} onFocus={highlight}>
          <td colSpan={7} className="px-3 py-3">
            <div className="flex flex-wrap items-end gap-4">
              <p className="max-w-[22ch] text-[0.78rem] text-subtle">
                Where the name sits on the plan. Leave empty to centre it.
              </p>
              {(
                [
                  ["x", "Name X", "ft"],
                  ["y", "Name Y", "ft"],
                  ["size", "Text size", "px, 11"],
                ] as const
              ).map(([k, label, hint]) => (
                <label key={k} className="grid gap-1 text-[0.75rem] text-muted">
                  {label}
                  <NumberInput
                    optional
                    value={r.label?.[k]}
                    onChange={setLabel(i, k)}
                    placeholder={hint}
                    className={`${cellInputClass} w-24 border-line-strong bg-raised`}
                  />
                </label>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const rotations: { value: OpeningRotation; label: string }[] = [
  { value: 0, label: "0° across" },
  { value: 180, label: "180° across" },
  { value: 90, label: "90° front–back" },
  { value: -90, label: "−90° front–back" },
];

export function OpeningsTable({ project, onChange, onHighlight }: Props) {
  const openings = project.openings;
  const setOpening = (i: number, o: Opening) => onChange((p) => ({ ...p, openings: listOps.replace(p.openings, i, o) }));

  function add(type: Opening["type"]) {
    const { width, depth, setbacks } = project.plot;
    onChange((p) => ({
      ...p,
      openings: [
        ...p.openings,
        { type, x: Math.round(width / 2), y: type === "door" ? depth - (setbacks.front || 0) : setbacks.rear || 0, rotate: 0, width: type === "door" ? 3 : 4 },
      ],
    }));
  }

  return (
    <div>
      {openings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
          No doors or windows yet.
        </p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm" onMouseLeave={() => onHighlight(null)}>
            <thead>
              <tr className="border-b border-line">
                <th className={th}>Type</th>
                <th className={th}>X</th>
                <th className={th}>Y</th>
                <th className={th}>Wall</th>
                <th className={th}>Width</th>
                <th className={`${th} text-center`}>Entrance</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {openings.map((o, i) => {
                const name = `${o.type} ${i + 1}`;
                const highlight = () => onHighlight({ kind: "opening", index: i });
                return (
                  <tr key={i} className="border-b border-line transition-colors hover:bg-raised/50" onMouseEnter={highlight} onFocus={highlight}>
                    <td className={td}>
                      <select
                        value={o.type}
                        onChange={(e) => {
                          const next: Opening = { ...o, type: e.target.value as Opening["type"] };
                          if (next.type === "window") delete next.entrance;
                          setOpening(i, next);
                        }}
                        aria-label={`Opening ${i + 1} type`}
                        className={`${cellInputClass} cursor-pointer`}
                      >
                        <option value="door">Door</option>
                        <option value="window">Window</option>
                      </select>
                    </td>
                    {(["x", "y"] as const).map((k) => (
                      <td key={k} className={`${td} w-[12%]`}>
                        <NumberInput value={o[k]} onChange={(n) => setOpening(i, { ...o, [k]: n ?? NaN })} aria-label={`${name} ${k.toUpperCase()} in feet`} />
                      </td>
                    ))}
                    <td className={td}>
                      <select
                        value={o.rotate}
                        onChange={(e) => setOpening(i, { ...o, rotate: Number(e.target.value) as OpeningRotation })}
                        aria-label={`${name} wall direction`}
                        className={`${cellInputClass} cursor-pointer`}
                      >
                        {rotations.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={`${td} w-[11%]`}>
                      <NumberInput value={o.width} onChange={(n) => setOpening(i, { ...o, width: n ?? NaN })} aria-label={`${name} width in feet`} />
                    </td>
                    <td className={`${td} text-center`}>
                      <input
                        type="checkbox"
                        checked={!!o.entrance}
                        disabled={o.type !== "door"}
                        onChange={(e) => {
                          const next = { ...o };
                          if (e.target.checked) next.entrance = true;
                          else delete next.entrance;
                          setOpening(i, next);
                        }}
                        aria-label={`${name} is the entrance`}
                        className="size-4 cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-30"
                      />
                    </td>
                    <td className={td}>
                      <RowActions
                        label={name}
                        onDuplicate={() => onChange((p) => ({ ...p, openings: listOps.insert(p.openings, i + 1, { ...o }) }))}
                        onRemove={() => {
                          onHighlight(null);
                          onChange((p) => ({ ...p, openings: listOps.remove(p.openings, i) }));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => add("door")}>
          <Plus className="size-3.5" aria-hidden="true" />
          Add door
        </Button>
        <Button variant="secondary" size="sm" onClick={() => add("window")}>
          <Plus className="size-3.5" aria-hidden="true" />
          Add window
        </Button>
      </div>
    </div>
  );
}
