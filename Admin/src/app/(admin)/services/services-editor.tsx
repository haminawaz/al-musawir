"use client";

import { DocumentPage } from "@/components/editors/document-page";
import { ItemControls } from "@/components/editors/list-editors";
import { ServiceArt } from "@/components/plan/service-art";
import { TextField } from "@/components/ui/field";
import { endpoints, type EndpointTypes } from "@/lib/api";
import { listOps, useDocument } from "@/lib/hooks";
import { validateServices } from "@/lib/validate";

export function ServicesEditor() {
  const doc = useDocument<EndpointTypes["services"]>(endpoints.services, {
    label: "Services",
    // The server also checks that the four service ids are unchanged.
    validate: (d) => validateServices(d, d),
  });

  return (
    <DocumentPage
      doc={doc}
      title="Services"
      description="The four services on the home page and the services page. Each has its own drawing on the website, so there are always four; the order can change."
    >
      {(services, change) => (
        <ol className="grid gap-4">
          {services.map((s, i) => {
            const set = (key: "name" | "summary" | "deliverables") => (value: string) =>
              change((list) => listOps.replace(list, i, { ...s, [key]: value }));
            return (
              <li key={s.id} className="grid gap-6 rounded-2xl border border-line bg-surface p-5 sm:p-6 md:grid-cols-[13rem_1fr]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <ItemControls
                      index={i}
                      count={services.length}
                      label={s.name}
                      onMove={(from, to) => change((list) => listOps.move(list, from, to))}
                    />
                  </div>
                  <div className="group rounded-xl border border-line bg-canvas bg-dots px-4 py-6 [--dots:16px]">
                    <ServiceArt id={s.id} className="mx-auto h-auto w-full" />
                  </div>
                  <p className="font-mono text-[0.68rem] text-subtle">id: {s.id}</p>
                </div>
                <div className="grid content-start gap-4">
                  <TextField label="Name" value={s.name} onChange={set("name")} />
                  <TextField label="Summary" multiline value={s.summary} onChange={set("summary")} help="One sentence, shown under the name." />
                  <TextField
                    label="You receive"
                    multiline
                    value={s.deliverables}
                    onChange={set("deliverables")}
                    help="Listed on the services page under the summary."
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </DocumentPage>
  );
}
