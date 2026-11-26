"use client";

import { DocumentPage } from "@/components/editors/document-page";
import { TitledListEditor } from "@/components/editors/list-editors";
import { endpoints, type EndpointTypes } from "@/lib/api";
import { useDocument } from "@/lib/hooks";
import { validateTitledList } from "@/lib/validate";

export function ProcessEditor() {
  const doc = useDocument<EndpointTypes["processSteps"]>(endpoints.processSteps, {
    label: "Process steps",
    validate: (d) => validateTitledList(d, "Step", 8),
  });
  return (
    <DocumentPage
      doc={doc}
      title="Process"
      description="How a job runs, from first message to final files. Shown on the home page and the about page, as four steps in a row."
    >
      {(steps, change) => <TitledListEditor value={steps} onChange={(v) => change(() => v)} itemName="Step" canAddRemove={false} />}
    </DocumentPage>
  );
}
