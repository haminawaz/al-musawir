"use client";

import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlotMap, type PlanHighlight } from "@/components/plan/plot-map";
import { Button, buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Field, inputClass, NumberField, SelectField, TextField } from "@/components/ui/field";
import { Card, ErrorState, ErrorSummary, LoadingState, PageTitle, SaveBar, Warnings } from "@/components/ui/layout";
import { useToast } from "@/components/ui/toast";
import { api, ApiError, endpoints, type EndpointTypes } from "@/lib/api";
import { useResource } from "@/lib/hooks";
import { canDraw, coverage, coveredArea, emptyProject, nextDrawingNo, plotArea, slugify, sqft, uniqueSlug } from "@/lib/plan";
import type { Project } from "@/lib/types";
import { useUnsavedChanges } from "@/lib/unsaved";
import { projectWarnings, validateProject } from "@/lib/validate";
import { OpeningsTable, RoomsTable } from "./plan-tables";

/** Edits one project, or creates one (optionally starting from a copy of another). */
export function ProjectEditor({ slug, duplicateOf }: { slug?: string; duplicateOf?: string }) {
  const isNew = slug === undefined;
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const categories = useResource<EndpointTypes["categories"]>(endpoints.categories);
  const projects = useResource<EndpointTypes["projects"]>(endpoints.projects);

  const [saved, setSaved] = useState<Project | null>(null);
  const [draft, setDraft] = useState<Project | null>(null);
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [highlight, setHighlight] = useState<PlanHighlight>(null);
  const [notFound, setNotFound] = useState(false);
  const [created, setCreated] = useState(false);

  // Starting point: the stored project, a copy of one, or a blank one.
  useEffect(() => {
    if (!projects.data || !categories.data || saved) return;
    const all = projects.data;
    let start: Project | undefined;
    if (!isNew) {
      start = all.find((p) => p.slug === slug);
      if (!start) return setNotFound(true);
    } else {
      const source = duplicateOf ? all.find((p) => p.slug === duplicateOf) : undefined;
      const drawingNo = nextDrawingNo(all);
      start = source
        ? {
            ...structuredClone(source),
            name: `${source.name} (copy)`,
            slug: uniqueSlug(`${source.slug}-copy`, all.map((p) => p.slug)),
            drawingNo,
          }
        : emptyProject(categories.data[0]?.id ?? "", drawingNo);
      if (source) setSlugEdited(true);
    }
    setSaved(start);
    setDraft(start);
  }, [projects.data, categories.data, saved, isNew, slug, duplicateOf]);

  const dirty = useMemo(
    // A copy counts as unsaved from the start: it only exists once created.
    () => (saved && draft ? JSON.stringify(saved) !== JSON.stringify(draft) || (isNew && !!duplicateOf && !created) : false),
    [saved, draft, isNew, duplicateOf, created],
  );
  useUnsavedChanges(dirty);

  const change = useCallback(
    (fn: (p: Project) => Project) =>
      setDraft((d) => {
        if (!d) return d;
        const next = fn(d);
        // New projects take their web address from the name until someone edits it.
        return isNew && !slugEdited && next.name !== d.name ? { ...next, slug: slugify(next.name) } : next;
      }),
    [isNew, slugEdited],
  );
  const set = <K extends keyof Project>(key: K) => (value: Project[K]) => change((p) => ({ ...p, [key]: value }));
  const setPlot = (key: "width" | "depth" | "road") => (n: number) => change((p) => ({ ...p, plot: { ...p.plot, [key]: n } }));
  const setSetback = (key: keyof Project["plot"]["setbacks"]) => (n: number) =>
    change((p) => ({ ...p, plot: { ...p.plot, setbacks: { ...p.plot.setbacks, [key]: n } } }));

  const save = useCallback(async () => {
    if (!draft) return;
    const problems = validateProject(draft, {
      categories: categories.data ?? [],
      projects: projects.data ?? [],
      originalSlug: slug,
    });
    setErrors(problems);
    if (problems.length) {
      toast.error("Some fields need fixing. See the list at the top.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      const result = isNew
        ? await api.post<Project>(endpoints.projects, draft)
        : await api.put<Project>(endpoints.project(slug), draft);
      setSaved(result);
      setDraft(result);
      if (isNew) setCreated(true);
      toast.success(isNew ? `${result.name} created.` : `${result.name} saved.`);
      if (isNew || result.slug !== slug) router.replace(`/projects/${result.slug}`);
    } catch (e) {
      if (e instanceof ApiError && e.details.length) setErrors(e.details);
      toast.error(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }, [draft, categories.data, projects.data, slug, isNew, toast, router]);

  async function remove() {
    if (!saved || isNew) return;
    const ok = await confirm({
      title: `Delete ${saved.name}?`,
      body: "It disappears from the website. This cannot be undone.",
      confirmLabel: "Delete project",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(endpoints.project(saved.slug));
      setSaved(draft); // nothing left to save
      toast.success(`${saved.name} deleted.`);
      router.push("/projects");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete.");
    }
  }

  const back = (
    <Link href="/projects" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
      <ArrowLeft className="size-4" aria-hidden="true" />
      Projects
    </Link>
  );

  const loadError = projects.state.status === "error" ? projects.state : categories.state.status === "error" ? categories.state : null;
  if (loadError)
    return (
      <>
        {back}
        <ErrorState
          message={loadError.message}
          onRetry={() => {
            projects.reload();
            categories.reload();
          }}
        />
      </>
    );
  if (notFound)
    return (
      <>
        {back}
        <ErrorState message={`There is no project at /projects/${slug}. It may have been deleted or renamed.`} onRetry={() => router.push("/projects")} />
      </>
    );
  if (!draft || !categories.data)
    return (
      <>
        {back}
        <LoadingState rows={3} />
      </>
    );

  const warnings = projectWarnings(draft);
  const drawable = canDraw(draft);
  const area = plotArea(draft);
  const covered = coveredArea(draft);

  return (
    <>
      {back}
      <PageTitle
        title={draft.name || (isNew ? "New project" : "Untitled project")}
        description={
          <span className="font-mono text-[0.8rem]">
            {draft.drawingNo || "No drawing no."} · /projects/{draft.slug || "…"}
          </span>
        }
        actions={
          !isNew && (
            <>
              <Link href={`/projects/new?duplicate=${saved?.slug ?? ""}`} className={buttonClass("secondary", "sm")}>
                <Copy className="size-3.5" aria-hidden="true" />
                Duplicate
              </Link>
              <Button variant="danger" size="sm" onClick={remove}>
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete
              </Button>
            </>
          )
        }
      />

      <ErrorSummary errors={errors} />

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <div className="grid gap-6 xl:col-span-7">
          <Card title="Details" description="Shown in the title block on the project page.">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Name" value={draft.name} onChange={set("name")} placeholder="Family house, 5 Marla" className="sm:col-span-2" />
              <Field
                label="Web address"
                help={isNew && !slugEdited ? "Filled in from the name." : "Changing it breaks links people have saved."}
                className="sm:col-span-2"
              >
                {(id, describedBy) => (
                  <div className="flex items-stretch">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-line-strong bg-canvas px-3 font-mono text-[0.8rem] text-subtle">
                      /projects/
                    </span>
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      value={draft.slug}
                      onChange={(e) => {
                        setSlugEdited(true);
                        set("slug")(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }}
                      className={`${inputClass} rounded-l-none font-mono text-[0.85rem]`}
                    />
                  </div>
                )}
              </Field>
              <SelectField
                label="Category"
                value={draft.category}
                onChange={set("category")}
                options={categories.data.map((c) => ({ value: c.id, label: c.label }))}
              />
              <TextField label="Drawing no." value={draft.drawingNo} onChange={set("drawingNo")} placeholder="AM-005" />
              <TextField label="City" value={draft.city} onChange={set("city")} />
              <TextField label="Society" value={draft.society} onChange={set("society")} />
              <TextField label="Client" value={draft.client} onChange={set("client")} />
              <TextField label="Plot no." value={draft.plotNo} onChange={set("plotNo")} />
              <TextField label="Floors" value={draft.floors} onChange={set("floors")} placeholder="Ground + first" />
              <TextField label="Scale" value={draft.scale} onChange={set("scale")} placeholder="1:100" />
              <TextField label="Date" value={draft.date} onChange={set("date")} placeholder="March 2026" />
              <TextField label="Status" value={draft.status} onChange={set("status")} placeholder="Approved" />
            </div>
          </Card>

          <Card title="Plot" description="In feet. Setbacks are the open space kept clear on each side.">
            <div className="grid gap-5 sm:grid-cols-3">
              <NumberField label="Width" suffix="ft" value={draft.plot.width} onChange={setPlot("width")} />
              <NumberField label="Depth" suffix="ft" value={draft.plot.depth} onChange={setPlot("depth")} />
              <NumberField label="Road width" suffix="ft" value={draft.plot.road} onChange={setPlot("road")} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-5 border-t border-line pt-5 sm:grid-cols-4">
              <NumberField label="Front setback" suffix="ft" value={draft.plot.setbacks.front} onChange={setSetback("front")} />
              <NumberField label="Rear setback" suffix="ft" value={draft.plot.setbacks.rear} onChange={setSetback("rear")} />
              <NumberField label="Left setback" suffix="ft" value={draft.plot.setbacks.left} onChange={setSetback("left")} />
              <NumberField label="Right setback" suffix="ft" value={draft.plot.setbacks.right} onChange={setSetback("right")} />
            </div>
          </Card>

          <Card
            title="Rooms"
            description="X and Y are feet from the rear-left corner of the plot: X runs across, Y runs from the rear towards the road. Point at a row to find it on the plan."
          >
            <RoomsTable project={draft} onChange={change} onHighlight={setHighlight} />
          </Card>

          <Card title="Doors and windows" description="X and Y are the centre of the opening, on a wall line. Mark the main door as the entrance.">
            <OpeningsTable project={draft} onChange={change} onHighlight={setHighlight} />
          </Card>
        </div>

        <div className="grid gap-4 xl:sticky xl:top-6 xl:col-span-5">
          <Card title="Plan preview" description="Drawn the way the project page draws it." bodyClassName="p-3 sm:p-4">
            {drawable ? (
              <div className="rounded-xl bg-white p-2 sm:p-3">
                <PlotMap project={draft} highlight={highlight} className="mx-auto block h-auto max-h-[68vh] w-full" />
              </div>
            ) : (
              <p className="px-3 py-10 text-center text-sm text-muted">Enter the plot width and depth to see the plan.</p>
            )}
            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
              {[
                ["Plot area", drawable ? sqft(area) : "–"],
                ["Covered area", sqft(Number.isFinite(covered) ? covered : 0)],
                ["Ground coverage", drawable ? `${coverage(draft)}%` : "–"],
                ["Rooms · openings", `${draft.rooms.length} · ${draft.openings.length}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface px-4 py-3">
                  <dt className="font-mono text-[0.62rem] tracking-widest text-subtle uppercase">{k}</dt>
                  <dd className="mt-0.5 text-sm tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            {warnings.length > 0 && (
              <div className="mt-3 px-1">
                <Warnings items={warnings} />
              </div>
            )}
          </Card>
        </div>
      </div>

      <SaveBar
        dirty={dirty || (isNew && !created)}
        saving={saving}
        onSave={save}
        onDiscard={() => {
          setDraft(saved);
          setErrors([]);
        }}
        saveLabel={isNew ? "Create project" : "Save changes"}
      />
    </>
  );
}
