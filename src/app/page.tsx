import Link from "next/link";
import { PlanFrame } from "@/components/plan/plan-frame";
import { PlanThumb } from "@/components/plan/plan-thumb";
import { ProjectGrid, ProjectTile } from "@/components/project-tile";
import { Band, buttonClass, PageBody, Split } from "@/components/ui";
import { getProject, projects } from "@/data/projects";
import { services } from "@/data/services";

export default function HomePage() {
  const heroProject = getProject("family-house-10-marla")!;

  return (
    <>
      <PageBody>
        <Split>
          <div>
            <h1>Your plot, drawn to the last inch.</h1>
            <p className="my-5 max-w-[46ch] text-muted">
              Residential and commercial plans, approval-ready drawings, and land survey for homeowners, builders and
              developers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact" className={buttonClass()}>
                Get your plot drawn
              </Link>
              <Link href="/projects" className={buttonClass("outline")}>
                See projects
              </Link>
            </div>
          </div>
          <PlanFrame>
            <PlanThumb project={heroProject} width={380} height={430} className="max-h-[460px]" />
          </PlanFrame>
        </Split>
      </PageBody>

      <Band>
        <h2>What we draw</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-6">
          {services.map((s) => (
            <Link key={s.name} href="/services" className="group block border-t-2 border-ink pt-3">
              <h3 className="group-hover:underline">{s.name}</h3>
              <p className="mb-4 text-muted">{s.summary}</p>
            </Link>
          ))}
        </div>
      </Band>

      <Band>
        <h2>Recent projects</h2>
        <ProjectGrid>
          {projects.slice(0, 3).map((p) => (
            <ProjectTile key={p.slug} project={p} />
          ))}
        </ProjectGrid>
        <p className="mt-6 mb-4">
          <Link href="/projects" className="underline">
            All projects
          </Link>
        </p>
      </Band>

      <Band>
        <h2>Also: land survey</h2>
        <p className="mb-4 max-w-[56ch] text-muted">
          Boundary and topographic surveys, so your drawings start from exact site measurements.
        </p>
        <Link href="/survey" className={buttonClass("outline")}>
          About land survey
        </Link>
      </Band>
    </>
  );
}
