import type { Metadata } from "next";
import { ProcessSteps } from "@/components/process-steps";
import { AccentTitle, Container, KeyValueTable, PageHeader, SectionHeader } from "@/components/ui";
import { getPage, getProcessSteps } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [text, processSteps] = await Promise.all([getPage("about"), getProcessSteps()]);

  return (
    <>
      <PageHeader label={text.header.label} title={<AccentTitle text={text.header} />} intro={text.header.intro} />
      <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{text.atAGlance.label}</p>
        </div>
        <div className="lg:col-span-8">
          <KeyValueTable rows={text.atAGlance.rows.map((row) => [row.label, row.value])} />
        </div>
      </Container>
      <Container className="pb-24 sm:pb-32">
        <SectionHeader index="01" label={text.process.label} title={<AccentTitle text={text.process} />} />
        <div className="mt-14">
          <ProcessSteps steps={processSteps} />
        </div>
      </Container>
    </>
  );
}
