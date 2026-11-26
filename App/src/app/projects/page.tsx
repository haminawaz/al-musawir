import type { Metadata } from "next";
import { ProjectBrowser } from "@/components/project-browser";
import { AccentTitle, Container, PageHeader } from "@/components/ui";
import { getCategories, getPage, getProjects } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const [text, projects, categories] = await Promise.all([getPage("projects"), getProjects(), getCategories()]);

  return (
    <>
      <PageHeader label={text.header.label} title={<AccentTitle text={text.header} />} intro={text.header.intro} />
      <Container className="py-14 sm:py-20">
        <ProjectBrowser projects={projects} categories={categories} empty={text.empty} />
      </Container>
    </>
  );
}
