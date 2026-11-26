import Link from "next/link";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/motion";
import { PlotMap } from "@/components/plan/plot-map";
import { ServiceArt } from "@/components/plan/service-art";
import { ProcessSteps } from "@/components/process-steps";
import { ProjectCard } from "@/components/project-card";
import ScrollVelocity from "@/components/react-bits/ScrollVelocity";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import Topography from "@/components/react-bits/Topography";
import { AccentTitle, ArrowIcon, buttonClass, Container, SectionHeader, textLinkClass } from "@/components/ui";
import { findProjectPage, getPage, getProcessSteps, getProjects, getServices, getSite, getSurveySpecs } from "@/lib/content";
import { plotSize, whatsappLink } from "@/lib/format";

// Wide card, narrow card, then narrow, wide: a zig-zag instead of a row of equal boxes.
const serviceSpans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];
const projectSpans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-7"];

export default async function HomePage() {
  const [text, { site }, services, processSteps, projects, surveySpecs] = await Promise.all([
    getPage("home"),
    getSite(),
    getServices(),
    getProcessSteps(),
    getProjects(),
    getSurveySpecs(),
  ]);
  const heroProject = (await findProjectPage(text.hero.featuredProject))?.project;

  return (
    <>
      <Hero
        text={text.hero}
        whatsappHref={whatsappLink(site.whatsappNumber)}
        drawing={
          heroProject && (
            <figure
              className="relative mx-auto w-full max-w-110 rounded-2xl border border-line bg-surface shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] motion-safe:fade-up"
              style={{ "--draw-delay": "0.2s" } as React.CSSProperties}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[0.7rem] text-subtle">
                <span className="tracking-[0.12em] uppercase">{heroProject.drawingNo} · Plot map</span>
                <span>{plotSize(heroProject)}</span>
              </div>
              <div className="px-3 py-4">
                <PlotMap project={heroProject} tone="model" animated className="mx-auto block h-auto max-h-[62vh] w-full" />
              </div>
              <figcaption className="flex items-center justify-between border-t border-line px-5 py-3 font-mono text-[0.7rem] text-subtle">
                <span>{heroProject.name}</span>
                <span>{heroProject.city}</span>
              </figcaption>
            </figure>
          )
        }
      />

      <div aria-hidden="true" className="border-b border-line py-10 sm:py-14">
        <ScrollVelocity
          texts={text.marquee.lines}
          velocity={35}
          numCopies={4}
          fontSize="clamp(2.25rem, 5.5vw, 4.75rem)"
          fontWeight={600}
          color="var(--color-line-strong)"
          outlineAlternate
          fadeEdges
        />
      </div>

      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeader
            index="01"
            label={text.servicesSection.label}
            title={<AccentTitle text={text.servicesSection} />}
            intro={text.servicesSection.intro}
            action={
              <Link href="/services" className={textLinkClass}>
                {text.servicesSection.linkLabel}
                <ArrowIcon className="size-4 transition group-hover:translate-x-1" />
              </Link>
            }
          />
          <Reveal stagger={0.08} className="mt-14 grid gap-4 md:grid-cols-12">
            {services.map((s, i) => (
              <SpotlightCard
                key={s.id}
                spotlightColor="#e5ae4b"
                intensity={0.09}
                spotlightSize={320}
                className={`group ${serviceSpans[i % serviceSpans.length]}`}
                style={
                  {
                    "--spotlight-card-surface": "var(--color-surface)",
                    borderRadius: "1rem",
                    padding: 0,
                  } as React.CSSProperties
                }
              >
                <Link href="/services" className="flex h-full flex-col p-7 sm:p-8">
                  <div className="flex items-center justify-between font-mono text-xs text-subtle">
                    <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="opacity-0 transition group-hover:opacity-100">View service →</span>
                  </div>
                  <ServiceArt id={s.id} className="mx-auto my-8 h-auto w-full max-w-75" />
                  <h3 className="mt-auto text-subheading">{s.name}</h3>
                  <p className="mt-2 max-w-[44ch] text-muted">{s.summary}</p>
                </Link>
              </SpotlightCard>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <SectionHeader index="02" label={text.processSection.label} title={<AccentTitle text={text.processSection} />} />
          <div className="mt-14">
            <ProcessSteps steps={processSteps} />
          </div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          <SectionHeader
            index="03"
            label={text.projectsSection.label}
            title={<AccentTitle text={text.projectsSection} />}
            intro={text.projectsSection.intro}
            action={
              <Link href="/projects" className={textLinkClass}>
                {text.projectsSection.linkLabel}
                <ArrowIcon className="size-4 transition group-hover:translate-x-1" />
              </Link>
            }
          />
          <Reveal stagger={0.1} className="mt-14 grid gap-5 lg:grid-cols-12">
            {projects.map((p, i) => (
              <div key={p.slug} className={projectSpans[i % projectSpans.length]}>
                <ProjectCard project={p} />
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="relative isolate overflow-hidden border-t border-line">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Topography color="#c99a45" opacity={0.55} lineCount={24} markers="plus" tilt={38} speed={0.15} />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-canvas via-canvas/85 to-canvas/20" />
        <Container className="grid gap-14 py-24 sm:py-32 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow">
              <span className="text-accent">04</span> / {text.surveySection.label}
            </p>
            <h2 className="mt-6 max-w-[14ch] text-heading">
              <AccentTitle text={text.surveySection} />
            </h2>
            <p className="mt-6 max-w-[46ch] text-muted">{text.surveySection.intro}</p>
            <Link href="/survey" className={`${buttonClass("secondary")} mt-10 bg-canvas/60 backdrop-blur`}>
              {text.surveySection.buttonLabel}
              <ArrowIcon />
            </Link>
          </div>
          <Reveal stagger={0.08} className="grid content-end gap-px self-end overflow-hidden rounded-2xl border border-line bg-line lg:col-span-5 lg:col-start-8">
            {surveySpecs.map((spec, i) => (
              <div key={i} className="bg-canvas/80 px-6 py-5 backdrop-blur">
                <p className="font-mono text-[0.7rem] tracking-[0.12em] text-subtle uppercase">{spec.title}</p>
                <p className="mt-1">{spec.text}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
