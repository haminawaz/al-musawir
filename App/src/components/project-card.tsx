import Link from "next/link";
import { coveredArea, plotArea, plotSize, type Project } from "@/data/projects";
import { PlanThumb } from "./plan/plan-thumb";
import { ArrowIcon } from "./ui";

/** Project card: the plan drawn in model space, name, plot size and three key numbers. */
export function ProjectCard({ project }: { project: Project }) {
  const area = plotArea(project);
  const covered = coveredArea(project);
  const stats = [
    ["Plot", `${area.toLocaleString("en-US")} sq ft`],
    ["Covered", `${covered.toLocaleString("en-US")} sq ft`],
    ["Coverage", `${Math.round((covered / area) * 100)}%`],
  ];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
    >
      <div className="relative flex h-72 items-center justify-center border-b border-line bg-dots px-6 pt-10 pb-6 [--dots:20px] sm:h-80">
        <span className="absolute top-4 left-5 font-mono text-[0.7rem] tracking-[0.12em] text-subtle uppercase">
          {project.drawingNo}
        </span>
        <span className="absolute top-4 right-5 font-mono text-[0.7rem] text-subtle">{project.city}</span>
        <PlanThumb
          project={project}
          interactive
          className="block h-full w-auto max-w-full"
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <h3 className="text-subheading">{project.name}</h3>
          <p className="mt-1 font-mono text-[0.8rem] text-muted">{plotSize(project)}</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
          <ArrowIcon className="size-4 -rotate-45 transition duration-300 group-hover:rotate-0" />
        </span>
      </div>
      <dl className="grid grid-cols-3 border-t border-line">
        {stats.map(([k, v]) => (
          <div key={k} className="border-r border-line px-5 py-3.5 last:border-r-0 sm:px-6">
            <dt className="font-mono text-[0.68rem] tracking-widest text-subtle uppercase">{k}</dt>
            <dd className="mt-0.5 text-sm tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
