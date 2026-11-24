import type { Metadata } from "next";
import { ProcessSteps } from "@/components/process-steps";
import { Accent, Container, KeyValueTable, PageHeader, SectionHeader } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        label="About"
        title={
          <>
            About <Accent>Al-Musawir.</Accent>
          </>
        }
        intro="Placeholder: a short paragraph about the naqsha nawees, years of experience, the cities he works in, and how he works with clients. Replace with his own words."
      />
      <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">At a glance</p>
        </div>
        <div className="lg:col-span-8">
          <KeyValueTable
            rows={[
              ["Experience", "Placeholder years"],
              ["Software", "AutoCAD, SketchUp"],
              ["Approvals handled", "Placeholder: LDA, CDA, RDA, housing societies"],
              ["Cities", "Placeholder"],
            ]}
          />
        </div>
      </Container>
      <Container className="pb-24 sm:pb-32">
        <SectionHeader
          index="01"
          label="How we work"
          title={
            <>
              Four steps, <Accent>start to finish.</Accent>
            </>
          }
        />
        <div className="mt-14">
          <ProcessSteps />
        </div>
      </Container>
    </>
  );
}
