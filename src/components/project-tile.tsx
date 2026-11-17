import Link from "next/link";
import { plotSize, type Project } from "@/data/projects";
import { PlanFrame } from "./plan/plan-frame";
import { PlanThumb } from "./plan/plan-thumb";

export function ProjectTile({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <PlanFrame variant="tile">
        <PlanThumb project={project} />
      </PlanFrame>
      <b className="mt-2.5 block">{project.name}</b>
      <span className="text-[.95rem] text-muted">
        {plotSize(project)}, {project.city}
      </span>
    </Link>
  );
}

export function ProjectGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">{children}</div>;
}
