"use client";

import { useState } from "react";
import { categories, type Category, type Project } from "@/data/projects";
import { ProjectGrid, ProjectTile } from "./project-tile";

type Filter = Category | "all";

const filters: { id: Filter; label: string }[] = [{ id: "all", label: "All" }, ...categories];

export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <div role="group" aria-label="Filter" className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const pressed = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setFilter(f.id)}
              className={`cursor-pointer rounded-md border px-3.5 py-1.75 text-[.9rem] leading-[normal] font-medium ${
                pressed ? "border-accent bg-accent text-on-accent" : "border-line bg-transparent text-ink"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <ProjectGrid>
        {shown.map((p) => (
          <ProjectTile key={p.slug} project={p} />
        ))}
      </ProjectGrid>
    </>
  );
}
