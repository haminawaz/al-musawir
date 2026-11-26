"use client";

import { ExternalLink, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ItemControls } from "@/components/editors/list-editors";
import { Button, Spinner } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { inputClass, TextField } from "@/components/ui/field";
import { Card, ErrorState, ErrorSummary, LoadingState, PageTitle, SaveBar } from "@/components/ui/layout";
import { useToast } from "@/components/ui/toast";
import { api, endpoints, isMockApi, type EndpointTypes } from "@/lib/api";
import { listOps, useDocument } from "@/lib/hooks";
import type { Site } from "@/lib/types";
import { validateNavigation, validateSite } from "@/lib/validate";

export function SettingsEditor() {
  const site = useDocument<EndpointTypes["site"]>(endpoints.site, { label: "Site settings", validate: validateSite });
  const nav = useDocument<EndpointTypes["navigation"]>(endpoints.navigation, {
    label: "Navigation",
    validate: (d) => validateNavigation(d, d),
  });
  const confirm = useConfirm();
  const toast = useToast();
  const [resetting, setResetting] = useState(false);

  async function saveAll() {
    // Save whichever has changes; each reports its own result.
    await Promise.all([site.dirty && site.save(), nav.dirty && nav.save()]);
  }

  async function resetMock() {
    const ok = await confirm({
      title: "Reset all content?",
      body: "Every project, service and piece of page text goes back to the copy taken from the website. Your edits here are lost.",
      confirmLabel: "Reset content",
      danger: true,
    });
    if (!ok) return;
    setResetting(true);
    try {
      await api.post(endpoints.resetMock);
      toast.success("Content reset.");
      site.reload();
      nav.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset.");
    } finally {
      setResetting(false);
    }
  }

  const error = site.state.status === "error" ? site.state : nav.state.status === "error" ? nav.state : null;
  const title = <PageTitle title="Settings" description="Business details, WhatsApp, search listing and the menu, used on every page of the website." />;
  if (error)
    return (
      <>
        {title}
        <ErrorState
          message={error.message}
          onRetry={() => {
            site.reload();
            nav.reload();
          }}
        />
      </>
    );
  if (!site.draft || !nav.draft)
    return (
      <>
        {title}
        <LoadingState />
      </>
    );

  const s = site.draft;
  const set = (key: Exclude<keyof Site, "seo">) => (value: string) => site.change((d) => ({ ...d, [key]: value }));
  const setSeo = (key: keyof Site["seo"]) => (value: string) => site.change((d) => ({ ...d, seo: { ...d.seo, [key]: value } }));
  const waDigits = /^\d{8,15}$/.test(s.whatsappNumber);

  return (
    <>
      {title}
      <ErrorSummary errors={[...site.errors, ...nav.errors]} />

      <div className="grid gap-6">
        <Card title="Business" description="Shown in the header, the footer and the title block of every drawing.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Business name" value={s.name} onChange={set("name")} />
            <TextField label="Header label" value={s.headerLabel} onChange={set("headerLabel")} help="Small text next to the logo on wide screens." />
            <TextField label="Tagline" value={s.tagline} onChange={set("tagline")} help="Shown in the footer after the name." className="sm:col-span-2" />
            <TextField label="Opening hours" value={s.hours} onChange={set("hours")} />
          </div>
        </Card>

        <Card title="WhatsApp" description="Every button on the website opens a chat with this number.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Number as shown" value={s.whatsappDisplay} onChange={set("whatsappDisplay")} placeholder="+92 300 1234567" />
            <TextField
              label="Number for the link"
              value={s.whatsappNumber}
              onChange={(v) => set("whatsappNumber")(v.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="923001234567"
              help="Digits only, starting with the country code (92), no + or spaces."
            />
          </div>
          <a
            href={`https://wa.me/${s.whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!waDigits}
            className={`mt-4 inline-flex items-center gap-1.5 text-sm transition ${
              waDigits ? "text-muted hover:text-fg" : "pointer-events-none text-subtle opacity-50"
            }`}
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Test the link: wa.me/{s.whatsappNumber || "…"}
          </a>
        </Card>

        <Card title="Search listing" description="How the home page appears in Google and when the link is shared.">
          <div className="grid gap-5">
            <TextField label="Title" value={s.seo.title} onChange={setSeo("title")} showCount={60} />
            <TextField label="Description" multiline value={s.seo.description} onChange={setSeo("description")} showCount={160} />
            <div className="rounded-xl border border-line bg-canvas px-5 py-4">
              <p className="eyebrow mb-2">Preview</p>
              <p className="truncate text-[1.05rem] text-[#8ab4f8]">{s.seo.title || "Title"}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted">{s.seo.description || "Description"}</p>
            </div>
          </div>
        </Card>

        <Card title="Menu" description="Labels and order of the links in the header and footer. The pages themselves are fixed.">
          <ol className="grid gap-2">
            {nav.draft.map((link, i, all) => (
              <li key={link.href} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-mono text-[0.78rem] text-subtle">{link.href}</span>
                <input
                  value={link.label}
                  onChange={(e) => nav.change((list) => listOps.replace(list, i, { ...link, label: e.target.value }))}
                  aria-label={`Menu label for ${link.href}`}
                  aria-invalid={!link.label.trim() || undefined}
                  className={inputClass}
                />
                <ItemControls
                  index={i}
                  count={all.length}
                  label={link.label}
                  onMove={(from, to) => nav.change((list) => listOps.move(list, from, to))}
                />
              </li>
            ))}
          </ol>
        </Card>

        {isMockApi && (
          <Card title="Mock data" description="The dashboard is running on the mock API built into this app, until the backend is ready.">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[60ch] text-sm text-muted">
                Changes are kept in <span className="font-mono text-fg">.mock-db.json</span> on the server. Reset puts everything back to the
                content copied from the website.
              </p>
              <Button variant="danger" size="sm" onClick={resetMock} disabled={resetting}>
                {resetting ? <Spinner className="size-3.5" /> : <RotateCcw className="size-3.5" aria-hidden="true" />}
                Reset content
              </Button>
            </div>
          </Card>
        )}
      </div>

      <SaveBar
        dirty={site.dirty || nav.dirty}
        saving={site.saving || nav.saving}
        onSave={saveAll}
        onDiscard={() => {
          site.discard();
          nav.discard();
        }}
      />
    </>
  );
}
