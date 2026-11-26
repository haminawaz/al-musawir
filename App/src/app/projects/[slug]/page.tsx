import type { Metadata } from "next";
import Link from "next/link";
import { Legend } from "@/components/plan/legend";
import { PlanThumb } from "@/components/plan/plan-thumb";
import { PlotMap } from "@/components/plan/plot-map";
import { PrintButton } from "@/components/print-button";
import CountUp from "@/components/react-bits/CountUp";
import { ArrowIcon, buttonClass, Container, KeyValueTable, Table, Td, Th, WhatsAppIcon } from "@/components/ui";
import { findProjectPage, getPage, getProjectPage, getProjectSlugs, getSite } from "@/lib/content";
import { coveredArea, fillTemplate, plotArea, plotSize, sqft, whatsappLink } from "@/lib/format";
import { describe, pageMetadata } from "@/lib/seo";
import type { ProjectSummary } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

// Projects that exist at build time are prerendered. Ones added later in the dashboard are rendered
// on their first visit and cached; unknown addresses show the 404 page.
export async function generateStaticParams() {
  return (await getProjectSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [page, { site }] = await Promise.all([findProjectPage((await params).slug), getSite()]);
  if (!page) return {};
  const { project } = page;
  const where = project.city ? ` in ${project.city}` : "";
  return pageMetadata({
    site,
    title: project.name,
    description: describe(`${project.name}: ${plotSize(project)} plot${where}. Plot map, room schedule and area statement.`),
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [{ project, previous, next }, text, { site }] = await Promise.all([getProjectPage(slug), getPage("projectDetail"), getSite()]);

  const { plot } = project;
  const { front, rear, left, right } = plot.setbacks;
  const area = plotArea(project);
  const covered = coveredArea(project);
  const coverage = area > 0 ? Math.round((covered / area) * 100) : 0;

  const stats = [
    { label: "Plot area", value: area, unit: "sq ft" },
    { label: "Covered area", value: covered, unit: "sq ft" },
    { label: "Ground coverage", value: coverage, unit: "%" },
    { label: "Road width", value: plot.road, unit: "ft" },
  ];
  const askMessage = fillTemplate(text.actions.whatsappMessage, { name: project.name, drawingNo: project.drawingNo });

  return (
    <>
      <section className="border-b border-line">
        <Container className="pt-10 pb-12 sm:pt-14">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-subtle print:hidden">
            <Link href="/projects" className="transition hover:text-fg">
              Projects
            </Link>
            <span className="mx-2">/</span>
            <span aria-current="page">{project.drawingNo}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-title">{project.name}</h1>
              <p className="mt-4 font-mono text-sm text-muted">
                {[plotSize(project), project.city, project.floors].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrintButton>{text.actions.printButtonLabel}</PrintButton>
              <a href={whatsappLink(site.whatsappNumber, askMessage)} className={buttonClass()}>
                <WhatsAppIcon className="size-5" />
                {text.actions.askButtonLabel}
              </a>
            </div>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4 print:hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-canvas px-5 py-5 sm:px-6">
                <dt className="font-mono text-[0.7rem] tracking-[0.12em] text-subtle uppercase">{s.label}</dt>
                <dd className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                  <CountUp to={s.value} separator="," duration={1.4} className="text-3xl font-semibold tracking-[-0.03em] tabular-nums sm:text-4xl" />{" "}
                  <span className="font-mono text-sm whitespace-nowrap text-muted">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="rounded-xl bg-white p-3 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] sm:p-5 lg:sticky lg:top-24 print:p-0 print:shadow-none">
            <PlotMap project={project} />
          </div>
        </div>
        <aside className="space-y-12 lg:col-span-5">
          <div>
            <h2 className="eyebrow mb-4">Title block</h2>
            <KeyValueTable
              rows={[
                ["Project", project.name],
                ["Client", project.client],
                ["Location", [project.city, project.society].filter(Boolean).join(", ")],
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
            <h2 className="eyebrow mb-4">Area statement</h2>
            <KeyValueTable
              rows={[
                ["Plot area", sqft(area)],
                ["Ground floor covered area", sqft(covered)],
                ["Ground coverage", `${coverage}%`],
                ["Setbacks", `Front ${front}', rear ${rear}', sides ${left}' and ${right}'`],
                ["Road width", `${plot.road}'`],
              ]}
            />
          </div>
          <div>
            <h2 className="eyebrow mb-5">Legend</h2>
            <Legend />
          </div>
        </aside>
      </Container>

      <Container className="grid gap-12 pb-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h2 className="eyebrow mb-4">Room schedule</h2>
          <Table>
            <thead>
              <tr>
                <Th scope="col">Room</Th>
                <Th scope="col">Size</Th>
                <Th scope="col" className="text-right">
                  Area
                </Th>
              </tr>
            </thead>
            <tbody>
              {project.rooms.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-surface">
                  <Td>{r.name}</Td>
                  <Td className="font-mono text-sm text-muted">
                    {r.w}&apos; x {r.d}&apos;
                  </Td>
                  <Td className="text-right">{sqft(r.w * r.d)}</Td>
                </tr>
              ))}
              <tr>
                <Td className="font-semibold">Total</Td>
                <Td />
                <Td className="text-right font-semibold text-accent">{sqft(covered)}</Td>
              </tr>
            </tbody>
          </Table>
        </div>
        <div className="lg:col-span-5">
          <h2 className="eyebrow mb-4">Notes</h2>
          <ol className="space-y-3 text-[0.95rem] text-muted">
            {text.notes.items.map((n, i) => (
              <li key={i} className="flex gap-4 border-b border-line pb-3">
                <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
                {n}
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <Container className="pb-24 print:hidden">
        <nav aria-label="More projects" className="grid gap-4 sm:grid-cols-2">
          {previous ? <NeighbourLink project={previous} direction="Previous" /> : <span className="hidden sm:block" />}
          {next && <NeighbourLink project={next} direction="Next" />}
        </nav>
      </Container>
    </>
  );
}

function NeighbourLink({ project, direction }: { project: ProjectSummary; direction: "Previous" | "Next" }) {
  const isNext = direction === "Next";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 transition duration-300 hover:border-line-strong ${
        isNext ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <div className="w-20 shrink-0 rounded-lg border border-line bg-canvas p-1.5">
        <PlanThumb project={project} interactive />
      </div>
      <div className="flex-1">
        <p className={`flex items-center gap-2 font-mono text-xs text-subtle ${isNext ? "sm:justify-end" : ""}`}>
          {!isNext && <ArrowIcon className="size-3.5 rotate-180" />}
          {direction}
          {isNext && <ArrowIcon className="size-3.5" />}
        </p>
        <p className="mt-1 font-medium">{project.name}</p>
        <p className="font-mono text-xs text-muted">{plotSize(project)}</p>
      </div>
    </Link>
  );
}
