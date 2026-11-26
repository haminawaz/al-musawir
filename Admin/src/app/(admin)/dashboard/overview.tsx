"use client";

import { ArrowRight, CircleCheck, FilePen, FolderOpen, PenTool, Plus, Tags, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Card, ErrorState, LoadingState, PageTitle } from "@/components/ui/layout";
import { endpoints, type EndpointTypes } from "@/lib/api";
import { plural, timeAgo } from "@/lib/format";
import { useResource } from "@/lib/hooks";
import { findPlaceholders } from "@/lib/placeholders";

const PLACEHOLDERS_SHOWN = 8;

export function Overview() {
  const content = useResource<EndpointTypes["content"]>(endpoints.content);
  const activity = useResource<EndpointTypes["activity"]>(endpoints.activity);
  const [showAll, setShowAll] = useState(false);

  const placeholders = useMemo(() => (content.data ? findPlaceholders(content.data) : []), [content.data]);

  if (content.state.status === "error")
    return <ErrorState message={content.state.message} onRetry={content.reload} />;
  if (!content.data)
    return (
      <>
        <PageTitle title="Overview" description="What is on the website, and what still needs filling in." />
        <LoadingState rows={3} />
      </>
    );

  const c = content.data;
  const shown = showAll ? placeholders : placeholders.slice(0, PLACEHOLDERS_SHOWN);
  const tiles = [
    { label: "Projects", value: c.projects.length, href: "/projects", icon: FolderOpen },
    { label: "Categories", value: c.categories.length, href: "/categories", icon: Tags },
    { label: "Services", value: c.services.length, href: "/services", icon: PenTool },
    {
      label: "Placeholders left",
      value: placeholders.length,
      href: "#placeholders",
      icon: placeholders.length ? TriangleAlert : CircleCheck,
      warn: placeholders.length > 0,
    },
  ];

  return (
    <>
      <PageTitle
        title="Overview"
        description="What is on the website, and what still needs filling in."
        actions={
          <Link href="/projects/new" className={buttonClass()}>
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Link>
        }
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {tiles.map(({ label, value, href, icon: Icon, warn }) => (
          <Link key={label} href={href} className="group bg-surface px-5 py-5 transition hover:bg-raised">
            <dt className="flex items-center justify-between font-mono text-[0.68rem] tracking-[0.12em] text-subtle uppercase">
              {label}
              <Icon className={`size-4 ${warn ? "text-accent" : "text-subtle group-hover:text-muted"}`} aria-hidden="true" />
            </dt>
            <dd className={`mt-2 text-3xl font-semibold tracking-[-0.03em] tabular-nums ${warn ? "text-accent" : ""}`}>{value}</dd>
          </Link>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Card
          className="lg:col-span-8"
          title={<span id="placeholders">Placeholders to replace</span>}
          description={
            placeholders.length
              ? `${plural(placeholders.length, "field")} on the website still ${placeholders.length === 1 ? "shows" : "show"} sample text or the dummy WhatsApp number.`
              : "Every field has real content."
          }
          bodyClassName=""
        >
          {placeholders.length === 0 ? (
            <p className="flex items-center gap-2 px-6 py-8 text-sm text-success">
              <CircleCheck className="size-4" aria-hidden="true" />
              Nothing left to replace.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {shown.map((p, i) => (
                  <li key={`${p.href}-${p.where}-${p.field}-${i}`}>
                    <Link
                      href={p.href}
                      className="group flex items-center gap-4 px-5 py-3 transition hover:bg-raised/60 sm:px-6"
                    >
                      <span className="w-24 shrink-0 font-mono text-[0.68rem] tracking-wider text-subtle uppercase">{p.area}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          {p.where} <span className="text-subtle">›</span> {p.field}
                        </span>
                        <span className="block truncate font-mono text-[0.75rem] text-accent/80">{p.value}</span>
                      </span>
                      <FilePen className="size-4 shrink-0 text-subtle transition group-hover:text-fg" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
              {placeholders.length > PLACEHOLDERS_SHOWN && (
                <div className="border-t border-line px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setShowAll((s) => !s)}
                    className="cursor-pointer text-sm text-muted underline decoration-line-strong underline-offset-4 transition hover:text-fg"
                  >
                    {showAll ? "Show fewer" : `Show all ${placeholders.length}`}
                  </button>
                </div>
              )}
            </>
          )}
        </Card>

        <div className="grid content-start gap-6 lg:col-span-4">
          <Card title="Recent changes" bodyClassName="">
            {activity.state.status === "error" ? (
              <p className="px-6 py-6 text-sm text-muted">{activity.state.message}</p>
            ) : !activity.data ? (
              <div className="grid gap-3 p-6">
                <div className="skeleton h-4" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ) : activity.data.length === 0 ? (
              <p className="px-6 py-6 text-sm text-muted">No changes yet. Edits made here will be listed.</p>
            ) : (
              <ol className="divide-y divide-line">
                {activity.data.slice(0, 8).map((a) => {
                  const body = (
                    <>
                      <span className="block text-sm">
                        <span className="text-muted">{a.user}</span> {a.action} <span className="font-medium">{a.target}</span>
                      </span>
                      <time dateTime={a.at} className="block font-mono text-[0.72rem] text-subtle" title={new Date(a.at).toLocaleString()}>
                        {timeAgo(a.at)}
                      </time>
                    </>
                  );
                  return (
                    <li key={a.id}>
                      {a.href ? (
                        <Link href={a.href} className="block px-5 py-3 transition hover:bg-raised/60 sm:px-6">
                          {body}
                        </Link>
                      ) : (
                        <div className="px-5 py-3 sm:px-6">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <Card
            title="Projects by category"
            actions={
              <Link href="/projects" className="inline-flex items-center gap-1 text-[0.8rem] text-muted transition hover:text-fg">
                All
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          >
            <ul className="grid gap-3">
              {c.categories.map((cat) => {
                const count = c.projects.filter((p) => p.category === cat.id).length;
                const width = c.projects.length ? (count / c.projects.length) * 100 : 0;
                return (
                  <li key={cat.id} className="grid gap-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat.label}</span>
                      <span className="font-mono text-subtle tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-raised">
                      <div className="h-full rounded-full bg-accent/70" style={{ width: `${width}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
