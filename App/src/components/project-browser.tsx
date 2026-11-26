"use client";

import { useState } from "react";
import type { Category, PageTexts, ProjectSummary } from "@/lib/types";
import { ProjectCard } from "./project-card";

export function ProjectBrowser({
  projects,
  categories,
  empty,
}: {
  projects: ProjectSummary[];
  categories: Category[];
  empty: PageTexts["projects"]["empty"];
}) {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const filters = [
    { id: "all", label: "All", count: projects.length },
    ...categories.map((c) => ({ id: c.id, label: c.label, count: projects.filter((p) => p.category === c.id).length })),
  ];

  return (
    <>
      <div role="group" aria-label="Filter by plot size" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const pressed = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setFilter(f.id)}
              className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition duration-200 active:scale-[0.97] ${
                pressed
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line-strong text-muted hover:border-subtle hover:text-fg"
              }`}
            >
              {f.label}
              <span className={`font-mono text-[0.72rem] ${pressed ? "text-on-accent/70" : "text-subtle"}`}>{f.count}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} {shown.length === 1 ? "project" : "projects"} shown
      </p>
      {shown.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-subheading">{empty.title}</p>
          <p className="mt-2 text-muted">{empty.text}</p>
        </div>
      )}
    </>
  );
}
