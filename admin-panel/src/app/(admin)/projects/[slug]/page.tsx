import type { Metadata } from "next";
import { ProjectEditor } from "../project-editor";

export const metadata: Metadata = { title: "Edit project" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProjectEditor slug={decodeURIComponent(slug)} />;
}
