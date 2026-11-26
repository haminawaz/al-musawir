"use client";

import Link from "next/link";
import { DocumentPage } from "@/components/editors/document-page";
import { PairsEditor, StringListEditor } from "@/components/editors/list-editors";
import { SelectField, TextField } from "@/components/ui/field";
import { Card, HeadingPreview } from "@/components/ui/layout";
import { endpoints, type EndpointTypes } from "@/lib/api";
import { useDocument, useResource } from "@/lib/hooks";
import { getPageDef, pageDefs, type FieldDef } from "@/lib/page-schema";
import type { FieldValue, PageContent, PageKey, Pair } from "@/lib/types";
import { validatePage } from "@/lib/validate";

export function PageTextEditor({ pageKey }: { pageKey: PageKey }) {
  const def = getPageDef(pageKey)!;
  // Keyed by page, so switching pages starts a fresh editor.
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[12rem_1fr]">
      <nav aria-label="Pages" className="lg:sticky lg:top-10">
        <p className="eyebrow mb-2 px-3">Pages</p>
        <ul className="flex gap-1 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
          {pageDefs.map((p) => {
            const current = p.key === pageKey;
            return (
              <li key={p.key} className="shrink-0">
                <Link
                  href={`/page-text?page=${p.key}`}
                  aria-current={current ? "page" : undefined}
                  className={`block rounded-lg px-3 py-1.5 text-[0.88rem] whitespace-nowrap transition ${
                    current ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg"
                  }`}
                >
                  {p.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0">
        <PageForm key={pageKey} pageKey={pageKey} title={def.title} path={def.path} />
      </div>
    </div>
  );
}

function PageForm({ pageKey, title, path }: { pageKey: PageKey; title: string; path: string }) {
  const def = getPageDef(pageKey)!;
  const doc = useDocument<EndpointTypes["page"]>(endpoints.page(pageKey), {
    label: `${title} page text`,
    validate: (d) => validatePage(pageKey, d),
  });
  const needsProjects = def.sections.some((s) => s.fields.some((f) => f.type === "project"));
  const projects = useResource<EndpointTypes["projects"]>(needsProjects ? endpoints.projects : null);

  return (
    <DocumentPage
      doc={doc}
      title={`${title} page text`}
      description={
        <>
          Words on <span className="font-mono text-[0.85em] text-fg">{path}</span>. Headings are split into plain words and an accent, which the
          website shows in amber italic.
        </>
      }
    >
      {(page, change) => (
        <div className="grid gap-6">
          {def.sections.map((section) => {
            const values = page[section.key] ?? {};
            const setField = (key: string) => (value: FieldValue) =>
              change((d: PageContent) => ({ ...d, [section.key]: { ...d[section.key], [key]: value } }));
            const hasHeading = section.fields.some((f) => f.key === "titleAccent");
            return (
              <Card key={section.key} title={section.title} description={section.description}>
                {hasHeading && (
                  <div className="mb-6 rounded-xl border border-line bg-canvas bg-dots px-5 py-4 [--dots:18px]">
                    <p className="eyebrow mb-2">
                      {typeof values.label === "string" ? values.label : typeof values.eyebrow === "string" ? values.eyebrow : "Preview"}
                    </p>
                    <HeadingPreview title={String(values.title ?? "")} accent={String(values.titleAccent ?? "")} />
                  </div>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  {section.fields.map((f) => (
                    <FieldInput
                      key={f.key}
                      field={f}
                      value={values[f.key]}
                      onChange={setField(f.key)}
                      projects={projects.data?.map((p) => ({ value: p.slug, label: `${p.name} (${p.drawingNo})` }))}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DocumentPage>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  projects,
}: {
  field: FieldDef;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  projects?: { value: string; label: string }[];
}) {
  const wide = field.type !== "text" && field.type !== "project" ? "sm:col-span-2" : "";
  switch (field.type) {
    case "list":
      return (
        <div className={wide}>
          <StringListEditor label={field.label} help={field.help} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
        </div>
      );
    case "pairs":
      return (
        <div className={wide}>
          <PairsEditor label={field.label} value={Array.isArray(value) ? (value as Pair[]) : []} onChange={onChange} />
        </div>
      );
    case "project":
      return (
        <SelectField
          label={field.label}
          help={field.help}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          options={projects ?? (typeof value === "string" ? [{ value, label: value }] : [])}
        />
      );
    default:
      return (
        <TextField
          label={field.label}
          help={field.help}
          multiline={field.type === "textarea"}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          className={wide}
        />
      );
  }
}
