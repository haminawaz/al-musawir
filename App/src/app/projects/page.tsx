import type { Metadata } from "next";
import { ProjectBrowser } from "@/components/project-browser";
import { Accent, Container, PageHeader } from "@/components/ui";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        label="Projects"
        title={
          <>
            Plot maps, <Accent>drawn to scale.</Accent>
          </>
        }
        intro="Select a plan to open its full plot map, room schedule and area statement."
      />
      <Container className="py-14 sm:py-20">
        <ProjectBrowser projects={projects} />
      </Container>
    </>
  );
}
