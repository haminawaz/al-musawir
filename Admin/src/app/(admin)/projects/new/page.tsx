import type { Metadata } from "next";
import { ProjectEditor } from "../project-editor";

export const metadata: Metadata = { title: "New project" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const { duplicate } = await searchParams;
  return <ProjectEditor duplicateOf={typeof duplicate === "string" ? duplicate : undefined} />;
}
