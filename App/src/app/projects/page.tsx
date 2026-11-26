import type { Metadata } from "next";
import { ProjectBrowser } from "@/components/project-browser";
import { AccentTitle, Container, PageHeader } from "@/components/ui";
import { getCategories, getPage, getProjects, getSite } from "@/lib/content";
import { describe, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [text, { site }] = await Promise.all([getPage("projects"), getSite()]);
  return pageMetadata({ site, title: text.header.label, description: describe(text.header.intro), path: "/projects" });
}

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
