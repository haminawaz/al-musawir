"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { listOps } from "@/lib/hooks";
import type { Pair } from "@/lib/types";

const iconButton =
  "grid size-8 cursor-pointer place-items-center rounded-md text-subtle transition hover:bg-raised hover:text-fg disabled:pointer-events-none disabled:opacity-30";

/** Up, down and remove buttons for one item in a list. */
export function ItemControls({
  index,
  count,
  label,
  onMove,
  onRemove,
  minItems = 1,
}: {
  index: number;
  count: number;
  label: string;
  onMove: (from: number, to: number) => void;
  onRemove?: () => void;
  minItems?: number;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={iconButton} disabled={index === 0} onClick={() => onMove(index, index - 1)} title="Move up">
        <ArrowUp className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Move {label} up</span>
      </button>
      <button type="button" className={iconButton} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} title="Move down">
        <ArrowDown className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Move {label} down</span>
      </button>
      {onRemove && (
        <button
          type="button"
          className={`${iconButton} hover:text-danger`}
          disabled={count <= minItems}
          onClick={onRemove}
          title={count <= minItems ? "Keep at least one" : "Remove"}
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Remove {label}</span>
        </button>
      )}
    </div>
  );
}

/** A list of short texts, such as the hero facts or the contact form plot sizes. */
export function StringListEditor({
  label,
  help,
  value,
  onChange,
  addLabel = "Add",
}: {
  label: string;
  help?: ReactNode;
  value: string[];
  onChange: (value: string[]) => void;
  addLabel?: string;
}) {
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-[0.82rem] font-medium">{label}</legend>
      <ol className="grid gap-2">
        {value.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right font-mono text-[0.7rem] text-subtle">{i + 1}</span>
            <input
              value={item}
              onChange={(e) => onChange(listOps.replace(value, i, e.target.value))}
              aria-label={`${label} ${i + 1}`}
              aria-invalid={!item.trim() || undefined}
              className={inputClass}
            />
            <ItemControls
              index={i}
              count={value.length}
              label={`${label} ${i + 1}`}
              onMove={(from, to) => onChange(listOps.move(value, from, to))}
              onRemove={() => onChange(listOps.remove(value, i))}
            />
          </li>
        ))}
      </ol>
      {help && <p className="text-[0.78rem] text-subtle">{help}</p>}
      <div>
        <Button variant="ghost" size="sm" onClick={() => onChange([...value, ""])} className="mt-1 -ml-2">
          <Plus className="size-3.5" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    </fieldset>
  );
}

/** Rows of label + value, such as the About page's "At a glance" table. */
export function PairsEditor({ label, value, onChange }: { label: string; value: Pair[]; onChange: (value: Pair[]) => void }) {
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-[0.82rem] font-medium">{label}</legend>
      <ol className="grid gap-2">
        {value.map((row, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              value={row.label}
              onChange={(e) => onChange(listOps.replace(value, i, { ...row, label: e.target.value }))}
              aria-label={`Row ${i + 1} label`}
              aria-invalid={!row.label.trim() || undefined}
              placeholder="Label"
              className={`${inputClass} w-2/5`}
            />
            <input
              value={row.value}
              onChange={(e) => onChange(listOps.replace(value, i, { ...row, value: e.target.value }))}
              aria-label={`Row ${i + 1} value`}
              aria-invalid={!row.value.trim() || undefined}
              placeholder="Value"
              className={inputClass}
            />
            <ItemControls
              index={i}
              count={value.length}
              label={`row ${i + 1}`}
              onMove={(from, to) => onChange(listOps.move(value, from, to))}
              onRemove={() => onChange(listOps.remove(value, i))}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button variant="ghost" size="sm" onClick={() => onChange([...value, { label: "", value: "" }])} className="mt-1 -ml-2">
          <Plus className="size-3.5" aria-hidden="true" />
          Add row
        </Button>
      </div>
    </fieldset>
  );
}

/** Numbered cards of title + text: process steps and land survey details. */
export function TitledListEditor({
  value,
  onChange,
  itemName,
  canAddRemove,
  maxItems = 12,
}: {
  value: { title: string; text: string }[];
  onChange: (value: { title: string; text: string }[]) => void;
  itemName: string;
  canAddRemove: boolean;
  maxItems?: number;
}) {
  return (
    <div className="grid gap-3">
      <ol className="grid gap-3">
        {value.map((item, i) => (
          <li key={i} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <span className="pt-2 font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
            <div className="grid flex-1 gap-3">
              <input
                value={item.title}
                onChange={(e) => onChange(listOps.replace(value, i, { ...item, title: e.target.value }))}
                aria-label={`${itemName} ${i + 1} title`}
                aria-invalid={!item.title.trim() || undefined}
                placeholder="Title"
                className={`${inputClass} font-medium`}
              />
              <textarea
                value={item.text}
                onChange={(e) => onChange(listOps.replace(value, i, { ...item, text: e.target.value }))}
                aria-label={`${itemName} ${i + 1} text`}
                aria-invalid={!item.text.trim() || undefined}
                placeholder="Text"
                rows={2}
                className={`${inputClass} field-sizing-content min-h-16 resize-y`}
              />
            </div>
            <ItemControls
              index={i}
              count={value.length}
              label={`${itemName} ${i + 1}`}
              onMove={(from, to) => onChange(listOps.move(value, from, to))}
              onRemove={canAddRemove ? () => onChange(listOps.remove(value, i)) : undefined}
            />
          </li>
        ))}
      </ol>
      {canAddRemove && value.length < maxItems && (
        <div>
          <Button variant="secondary" size="sm" onClick={() => onChange([...value, { title: "", text: "" }])}>
            <Plus className="size-3.5" aria-hidden="true" />
            Add {itemName.toLowerCase()}
          </Button>
        </div>
      )}
    </div>
  );
}
