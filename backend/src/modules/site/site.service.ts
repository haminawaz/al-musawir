import { db, type DbClient } from "../../db/client.js";
import type { SiteSettings } from "../../generated/prisma/client.js";
import { notFound, ValidationError } from "../../lib/errors.js";
import { recordActivity, type Actor } from "../activity/activity.service.js";
import type { NavLinkInput, SiteInput } from "./site.schema.js";

const SITE_ID = 1;

export type SiteDto = SiteInput;
export type NavLinkDto = { href: string; label: string };

const toSiteDto = (r: SiteSettings): SiteDto => ({
  name: r.name,
  tagline: r.tagline,
  headerLabel: r.headerLabel,
  whatsappDisplay: r.whatsappDisplay,
  whatsappNumber: r.whatsappNumber,
  hours: r.hours,
  seo: { title: r.seoTitle, description: r.seoDescription },
});

const toSiteRow = (s: SiteInput) => ({
  name: s.name,
  tagline: s.tagline,
  headerLabel: s.headerLabel,
  whatsappDisplay: s.whatsappDisplay,
  whatsappNumber: s.whatsappNumber,
  hours: s.hours,
  seoTitle: s.seo.title,
  seoDescription: s.seo.description,
});

export async function getSite(client: DbClient): Promise<SiteDto> {
  const row = await client.siteSettings.findUnique({ where: { id: SITE_ID } });
  if (!row) throw notFound("Site settings are not set up yet. Run `npm run db:seed`.");
  return toSiteDto(row);
}

export function updateSite(input: SiteInput, actor: Actor): Promise<SiteDto> {
  return db.$transaction(async (tx) => {
    const data = toSiteRow(input);
    const row = await tx.siteSettings.upsert({ where: { id: SITE_ID }, create: { id: SITE_ID, ...data }, update: data });
    await recordActivity(tx, actor, { action: "updated", target: "Site settings", href: "/settings" });
    return toSiteDto(row);
  });
}

export function listNavigation(client: DbClient): Promise<NavLinkDto[]> {
  return client.navLink.findMany({ orderBy: { position: "asc" }, select: { href: true, label: true } });
}

/** Labels and order can change; the set of pages cannot, because the website defines them. */
export function updateNavigation(input: NavLinkInput[], actor: Actor): Promise<NavLinkDto[]> {
  return db.$transaction(async (tx) => {
    const expected = (await listNavigation(tx)).map((l) => l.href);
    const given = input.map((l) => l.href);
    if (given.length !== expected.length || !expected.every((href) => given.includes(href)))
      throw new ValidationError([`Navigation must keep the same pages: ${expected.join(", ")}.`]);

    for (const [position, link] of input.entries())
      await tx.navLink.update({ where: { href: link.href }, data: { label: link.label, position } });
    await recordActivity(tx, actor, { action: "updated", target: "Navigation", href: "/settings" });
    return listNavigation(tx);
  });
}
