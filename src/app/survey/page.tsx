import type { Metadata } from "next";
import Link from "next/link";
import { PlanFrame } from "@/components/plan/plan-frame";
import { line, text } from "@/components/plan/styles";
import { buttonClass, KeyValueTable, PageBody, Split } from "@/components/ui";

export const metadata: Metadata = { title: "Land survey" };

const corners = [
  [70, 80],
  [400, 50],
  [440, 250],
  [110, 280],
];

export default function SurveyPage() {
  return (
    <PageBody>
      <h1>Land survey</h1>
      <p className="mt-4 mb-8 max-w-[56ch] text-muted">
        Accurate site measurement before any drawing begins. Every survey comes with a drawing file.
      </p>
      <Split align="start">
        <KeyValueTable
          rows={[
            ["Boundary demarcation", "Plot corners marked and measured against your documents."],
            ["Topographic survey", "Levels and contours for sloped or uneven sites."],
            ["Equipment", "Total Station and GPS."],
            ["You receive", "PDF plan and DWG file."],
          ]}
        />
        <PlanFrame>
          <svg viewBox="0 0 500 320" role="img" aria-label="Plot boundary with contours" className="block h-auto w-full max-h-[430px]">
            <path className="fill-none stroke-ink stroke-2" d="M70 80L400 50L440 250L110 280Z" />
            <path
              className={line.dimension}
              d="M95 130C200 100 300 150 420 110M100 190C210 160 310 210 430 170M105 235C215 215 315 255 435 225"
            />
            {corners.map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={5} />
            ))}
            <text className={text.note} x={250} y={308} textAnchor="middle">
              Boundary points and contours
            </text>
          </svg>
        </PlanFrame>
      </Split>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/contact" className={buttonClass()}>
          Book a survey
        </Link>
      </div>
    </PageBody>
  );
}
