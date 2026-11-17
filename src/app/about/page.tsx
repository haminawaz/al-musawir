import type { Metadata } from "next";
import { KeyValueTable, PageBody, Split } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PageBody>
      <Split align="start">
        <div>
          <h1>About Al-Musawir</h1>
          <p className="mt-5 mb-4 max-w-[48ch] text-muted">
            Placeholder: a short paragraph about the naqsha nawees, years of experience, the cities he works in, and how
            he works with clients. Replace with his own words.
          </p>
        </div>
        <KeyValueTable
          rows={[
            ["Experience", "Placeholder years"],
            ["Software", "AutoCAD, SketchUp"],
            ["Approvals handled", "Placeholder: LDA, CDA, RDA, housing societies"],
            ["Cities", "Placeholder"],
          ]}
        />
      </Split>
    </PageBody>
  );
}
