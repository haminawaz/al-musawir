import type { TitledItem } from "@/lib/types";
import { Reveal } from "./motion";

/** Numbered steps joined like a dimension string. */
export function ProcessSteps({ steps }: { steps: TitledItem[] }) {
  return (
    <Reveal
      stagger={0.1}
      className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
    >
      {steps.map((step, i) => (
        <div key={`${i}-${step.title}`} className="bg-canvas p-7 sm:p-8">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
            <span className="h-px flex-1 bg-line-strong" />
            <span className="h-3 w-px bg-line-strong" />
          </div>
          <h3 className="mt-12 text-subheading">
            <span className="sr-only">Step {i + 1}: </span>
            {step.title}
          </h3>
          <p className="mt-3 text-muted">{step.text}</p>
        </div>
      ))}
    </Reveal>
  );
}
