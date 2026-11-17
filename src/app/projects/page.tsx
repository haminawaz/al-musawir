import type { Metadata } from "next";
import { ProjectBrowser } from "@/components/project-browser";
import { PageBody } from "@/components/ui";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <PageBody>
      <h1>Projects</h1>
      <p className="mt-4 mb-7 text-muted">Select a plan to open its full plot map.</p>
      <ProjectBrowser projects={projects} />
    </PageBody>
  );
}
