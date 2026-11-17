import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Legend } from "@/components/plan/legend";
import { PlotMap } from "@/components/plan/plot-map";
import { PrintButton } from "@/components/print-button";
import { KeyValueTable, PageBody, Table, Td, Th } from "@/components/ui";
import { coveredArea, getProject, plotArea, plotSize, projects, sqft } from "@/data/projects";
import { site } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

const notes = [
  "All dimensions are in feet and inches unless stated.",
  "Room sizes are internal clear sizes (placeholder).",
  "This is a sample drawing for design preview only. Not for construction or approval.",
  "Verify all dimensions on site before work begins.",
];

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project?.name };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const { plot } = project;
  const { front, rear, left, right } = plot.setbacks;
  const covered = coveredArea(project);

  return (
    <PageBody>
      <Link href="/projects" className="mb-4 inline-block text-muted underline print:hidden">
        Back to projects
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="max-w-none">{project.name}</h1>
        <PrintButton>Print this map</PrintButton>
      </div>

      <div className="overflow-x-auto border border-ink bg-white p-3 print:border-0">
        <PlotMap project={project} />
      </div>

      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-8">
        <div>
          <h2>Title block</h2>
          <KeyValueTable
            rows={[
              ["Project", project.name],
              ["Client", project.client],
              ["Location", `${project.city}, ${project.society}`],
              ["Plot no.", project.plotNo],
              ["Plot size", plotSize(project)],
              ["Floors", project.floors],
              ["Drawing no.", project.drawingNo],
              ["Scale", project.scale],
              ["Date", project.date],
              ["Drawn by", site.name],
              ["Status", project.status],
            ]}
          />
        </div>
        <div>
          <h2>Area statement</h2>
          <KeyValueTable
            rows={[
              ["Plot area", sqft(plotArea(project))],
              ["Ground floor covered area", sqft(covered)],
              ["Ground coverage", `${Math.round((covered / plotArea(project)) * 100)}%`],
              ["Setbacks", `Front ${front}', rear ${rear}', sides ${left}' and ${right}'`],
              ["Road width", `${plot.road}'`],
            ]}
          />
          <h2 className="mt-7">Legend</h2>
          <Legend />
        </div>
        <div>
          <h2>Room schedule</h2>
          <Table>
            <thead>
              <tr>
                <Th scope="col">Room</Th>
                <Th scope="col">Size</Th>
                <Th scope="col">Area</Th>
              </tr>
            </thead>
            <tbody>
              {project.rooms.map((r) => (
                <tr key={r.name}>
                  <Td>{r.name}</Td>
                  <Td>
                    {r.w}&apos; x {r.d}&apos;
                  </Td>
                  <Td>{sqft(r.w * r.d)}</Td>
                </tr>
              ))}
              <tr>
                <Td>
                  <b>Total</b>
                </Td>
                <Td />
                <Td>
                  <b>{sqft(covered)}</b>
                </Td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>

      <h2 className="mt-9">Notes</h2>
      <ol className="max-w-[70ch] list-decimal ps-5 text-muted">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ol>

      <nav aria-label="More projects" className="mt-8 flex flex-wrap justify-between gap-3 print:hidden">
        <span>
          {prev && (
            <Link href={`/projects/${prev.slug}`} className="underline">
              Previous: {prev.name}
            </Link>
          )}
        </span>
        <span>
          {next && (
            <Link href={`/projects/${next.slug}`} className="underline">
              Next: {next.name}
            </Link>
          )}
        </span>
      </nav>
    </PageBody>
  );
}
