"use client";

import { Plus } from "lucide-react";
import { DocumentPage } from "@/components/editors/document-page";
import { ItemControls } from "@/components/editors/list-editors";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { endpoints, type EndpointTypes } from "@/lib/api";
import { plural } from "@/lib/format";
import { listOps, useDocument, useResource } from "@/lib/hooks";
import { slugify } from "@/lib/plan";
import { validateCategories } from "@/lib/validate";

export function CategoriesEditor() {
  const projects = useResource<EndpointTypes["projects"]>(endpoints.projects);
  const doc = useDocument<EndpointTypes["categories"]>(endpoints.categories, {
    label: "Categories",
    validate: (d) => validateCategories(d, projects.data ?? []),
  });
  const savedIds = new Set(doc.saved?.map((c) => c.id));
  const usage = (id: string) => projects.data?.filter((p) => p.category === id).length ?? 0;

  return (
    <DocumentPage
      doc={doc}
      title="Categories"
      description="Plot sizes used to group projects. They are the filter buttons on the website's projects page, in this order."
    >
      {(categories, change) => (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 font-mono text-[0.65rem] font-normal tracking-widest text-subtle uppercase">Name</th>
                <th className="px-3 py-3 font-mono text-[0.65rem] font-normal tracking-widest text-subtle uppercase">Id</th>
                <th className="px-3 py-3 font-mono text-[0.65rem] font-normal tracking-widest text-subtle uppercase">Projects</th>
                <th className="px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => {
                // Saved ids are locked. A new row that repeats one stays editable, and validation flags the clash.
                const isSaved = savedIds.has(c.id) && categories.findIndex((x) => x.id === c.id) === i;
                const used = usage(c.id);
                return (
                  <tr key={i} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-2.5">
                      <input
                        value={c.label}
                        onChange={(e) => {
                          const label = e.target.value;
                          // New categories take their id from the name until the id is edited by hand.
                          const id = !isSaved && c.id === slugify(c.label) ? slugify(label) : c.id;
                          change((list) => listOps.replace(list, i, { id, label }));
                        }}
                        aria-label={`Category ${i + 1} name`}
                        aria-invalid={!c.label.trim() || undefined}
                        placeholder="2 Kanal"
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      {isSaved ? (
                        <span className="font-mono text-[0.8rem] text-muted" title="Projects refer to this id, so it cannot change.">
                          {c.id}
                        </span>
                      ) : (
                        <input
                          value={c.id}
                          onChange={(e) => change((list) => listOps.replace(list, i, { ...c, id: e.target.value.toLowerCase() }))}
                          aria-label={`Category ${i + 1} id`}
                          className={`${inputClass} font-mono text-[0.82rem]`}
                        />
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted tabular-nums">{projects.data ? plural(used, "project") : "…"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end">
                        <ItemControls
                          index={i}
                          count={categories.length}
                          label={c.label || `category ${i + 1}`}
                          onMove={(from, to) => change((list) => listOps.move(list, from, to))}
                          onRemove={used ? undefined : () => change((list) => listOps.remove(list, i))}
                        />
                        {used > 0 && <span className="w-8" title="In use by projects, so it cannot be removed." />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-line px-5 py-3">
            <Button variant="ghost" size="sm" className="-ml-2" onClick={() => change((list) => [...list, { id: "", label: "" }])}>
              <Plus className="size-3.5" aria-hidden="true" />
              Add category
            </Button>
          </div>
        </div>
      )}
    </DocumentPage>
  );
}
