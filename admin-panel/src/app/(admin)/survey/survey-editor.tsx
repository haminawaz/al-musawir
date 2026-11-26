"use client";

import { DocumentPage } from "@/components/editors/document-page";
import { TitledListEditor } from "@/components/editors/list-editors";
import { endpoints, type EndpointTypes } from "@/lib/api";
import { useDocument } from "@/lib/hooks";
import { validateTitledList } from "@/lib/validate";

export function SurveyEditor() {
  const doc = useDocument<EndpointTypes["surveySpecs"]>(endpoints.surveySpecs, {
    label: "Land survey details",
    validate: (d) => validateTitledList(d, "Detail", 12),
  });
  return (
    <DocumentPage
      doc={doc}
      title="Land survey"
      description="The survey details listed on the land survey page and in the home page's survey section. The page's heading and button are under Page text."
    >
      {(specs, change) => <TitledListEditor value={specs} onChange={(v) => change(() => v)} itemName="Detail" canAddRemove />}
    </DocumentPage>
  );
}
