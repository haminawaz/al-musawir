import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import Topography from "@/components/react-bits/Topography";
import { Accent, buttonClass, Container, WhatsAppIcon } from "@/components/ui";
import { surveySpecs } from "@/data/services";
import { whatsappLink } from "@/data/site";

export const metadata: Metadata = { title: "Land survey" };

const corners: [number, number, string][] = [
  [70, 80, "A"],
  [400, 50, "B"],
  [440, 250, "C"],
  [110, 280, "D"],
];

const delay = (s: number) => ({ "--draw-delay": `${s}s` }) as React.CSSProperties;

export default function SurveyPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Topography color="#c99a45" opacity={0.6} lineCount={26} markers="plus" tilt={40} speed={0.15} />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-canvas via-canvas/80 to-canvas/10" />
        <Container className="pt-16 pb-20 sm:pt-28 sm:pb-32">
          <p className="eyebrow motion-safe:fade-up">Land survey</p>
          <h1 className="mt-6 max-w-[13ch] text-title motion-safe:fade-up" style={delay(0.08)}>
            Before we draw, <Accent>we measure.</Accent>
          </h1>
          <p className="mt-6 max-w-[50ch] text-lg text-muted motion-safe:fade-up" style={delay(0.16)}>
            Accurate site measurement before any drawing begins. Every survey comes with a drawing file.
          </p>
          <a
            href={whatsappLink("Hi, I would like to book a land survey.")}
            className={`${buttonClass()} mt-10 motion-safe:fade-up`}
            style={delay(0.24)}
          >
            <WhatsAppIcon className="size-5" />
            Book a survey
          </a>
        </Container>
      </section>

      <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-10">
        <Reveal stagger={0.08} className="grid content-start gap-px self-start overflow-hidden rounded-2xl border border-line bg-line lg:col-span-5">
          {surveySpecs.map(([k, v], i) => (
            <div key={k} className="flex gap-5 bg-canvas px-6 py-6">
              <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-medium">{k}</h2>
                <p className="mt-1 text-muted">{v}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <figure className="rounded-2xl border border-line bg-surface bg-dots p-6 [--dots:20px] sm:p-10 lg:col-span-7">
          <svg viewBox="0 0 500 320" role="img" aria-label="Plot boundary with contours" className="block h-auto w-full">
            <path
              pathLength={1}
              className="fill-none stroke-fg stroke-2 motion-safe:draw"
              style={{ ...delay(0.2), "--draw-duration": "1.6s" } as React.CSSProperties}
              d="M70 80L400 50L440 250L110 280Z"
            />
            <path
              pathLength={1}
              className="fill-none stroke-accent/70 stroke-1 motion-safe:draw"
              style={{ ...delay(0.9), "--draw-duration": "1.8s" } as React.CSSProperties}
              d="M95 130C200 100 300 150 420 110M100 190C210 160 310 210 430 170M105 235C215 215 315 255 435 225"
            />
            {corners.map(([cx, cy, name], i) => (
              <g key={name} className="motion-safe:fade-up" style={delay(1.4 + i * 0.12)}>
                <circle cx={cx} cy={cy} r={5} className="fill-accent" />
                <circle cx={cx} cy={cy} r={11} className="fill-none stroke-accent/40" />
                <text x={cx + 14} y={cy - 10} className="fill-muted font-mono text-[11px]">
                  {name}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="mt-6 flex justify-between border-t border-line pt-4 font-mono text-xs text-subtle">
            <span>Boundary points and contours</span>
            <span>Total Station + GPS</span>
          </figcaption>
        </figure>
      </Container>
    </>
  );
}
