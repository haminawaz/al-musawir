"use client";

import { Copy, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PlanThumb } from "@/components/plan/plan-thumb";
import { buttonClass } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { inputClass } from "@/components/ui/field";
import { EmptyState, ErrorState, LoadingState, PageTitle } from "@/components/ui/layout";
import { useToast } from "@/components/ui/toast";
import { api, endpoints, type EndpointTypes } from "@/lib/api";
import { plural } from "@/lib/format";
import { useResource } from "@/lib/hooks";
import { coverage, coveredArea, plotArea, plotSize } from "@/lib/plan";
import type { Project } from "@/lib/types";

export function ProjectsList() {
  const projects = useResource<EndpointTypes["projects"]>(endpoints.projects);
  const categories = useResource<EndpointTypes["categories"]>(endpoints.categories);
  const confirm = useConfirm();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const list = projects.data ?? [];
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (p) =>
        (filter === "all" || p.category === filter) &&
        (!q || [p.name, p.city, p.drawingNo, p.slug, p.client].some((s) => s.toLowerCase().includes(q))),
    );
  }, [list, query, filter]);

  const categoryLabel = (id: string) => categories.data?.find((c) => c.id === id)?.label ?? id;

  async function remove(p: Project) {
    const ok = await confirm({
      title: `Delete ${p.name}?`,
      body: "It disappears from the website. This cannot be undone.",
      confirmLabel: "Delete project",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(endpoints.project(p.slug));
      projects.setData(list.filter((x) => x.slug !== p.slug));
      toast.success(`${p.name} deleted.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete.");
    }
  }

  const title = (
    <PageTitle
      title="Projects"
      description="Plans shown on the website. Each one gets a page with its plot map, room schedule and area statement."
      actions={
        <Link href="/projects/new" className={buttonClass()}>
          <Plus className="size-4" aria-hidden="true" />
          New project
        </Link>
      }
    />
  );

  if (projects.state.status === "error")
    return (
      <>
        {title}
        <ErrorState message={projects.state.message} onRetry={projects.reload} />
      </>
    );
  if (!projects.data)
    return (
      <>
        {title}
        <LoadingState rows={2} />
      </>
    );

  const filters = [
    { id: "all", label: "All", count: list.length },
    ...(categories.data ?? []).map((c) => ({ ...c, count: list.filter((p) => p.category === c.id).length })),
  ];

  return (
    <>
      {title}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const pressed = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFilter(f.id)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.82rem] transition ${
                  pressed ? "border-accent bg-accent text-on-accent" : "border-line-strong text-muted hover:border-subtle hover:text-fg"
                }`}
              >
                {f.label}
                <span className={`font-mono text-[0.7rem] ${pressed ? "text-on-accent/70" : "text-subtle"}`}>{f.count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, city, drawing no."
            aria-label="Search projects"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {plural(shown.length, "project")} shown
      </p>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No projects yet"
            text="Add the first plan. It appears on the website's projects page."
            action={
              <Link href="/projects/new" className={buttonClass()}>
                <Plus className="size-4" aria-hidden="true" />
                New project
              </Link>
            }
          />
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No projects match" text="Try another search or category." />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug} className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-line-strong">
              <Link href={`/projects/${p.slug}`} className="flex flex-1 flex-col">
                <div className="relative flex h-52 items-center justify-center border-b border-line bg-dots px-6 pt-8 pb-4 [--dots:18px]">
                  <span className="absolute top-3 left-4 font-mono text-[0.68rem] tracking-[0.12em] text-subtle uppercase">
                    {p.drawingNo}
                  </span>
                  <span className="absolute top-3 right-4 rounded-full border border-line-strong px-2 py-0.5 text-[0.7rem] text-muted">
                    {categoryLabel(p.category)}
                  </span>
                  <PlanThumb project={p} interactive className="block h-full w-auto max-w-full" />
                </div>
                {/* Right padding leaves room for the duplicate and delete buttons. */}
                <div className="flex-1 px-4 pt-4 pr-22 pb-3">
                  <h2 className="font-semibold tracking-[-0.01em]">{p.name}</h2>
                  <p className="mt-0.5 font-mono text-[0.75rem] text-muted">
                    {plotSize(p)} · {p.city || "No city"}
                  </p>
                </div>
                <dl className="grid grid-cols-3 border-t border-line text-[0.78rem]">
                  {[
                    ["Plot", `${plotArea(p).toLocaleString("en-US")} ft²`],
                    ["Covered", `${coveredArea(p).toLocaleString("en-US")} ft²`],
                    ["Coverage", `${coverage(p)}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="border-r border-line px-4 py-2.5 last:border-r-0">
                      <dt className="font-mono text-[0.62rem] tracking-widest text-subtle uppercase">{k}</dt>
                      <dd className="tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Link>
              <div className="absolute right-3 bottom-[4.4rem] flex gap-1 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <Link
                  href={`/projects/new?duplicate=${p.slug}`}
                  title="Duplicate"
                  className={`${buttonClass("secondary", "icon")} bg-surface`}
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Duplicate {p.name}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  title="Delete"
                  className={`${buttonClass("danger", "icon")} bg-surface`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Delete {p.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
