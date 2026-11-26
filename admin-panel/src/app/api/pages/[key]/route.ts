import { getPageDef } from "@/lib/page-schema";
import type { PageContent, PageKey } from "@/lib/types";
import { validatePage } from "@/lib/validate";
import { read, update } from "@/mock/db";
import { fail, ok, readJson, withUser } from "@/mock/http";

type Context = { params: Promise<{ key: string }> };

export const GET = withUser(async (_request, { params }: Context) => {
  const { key } = await params;
  if (!getPageDef(key)) return fail(404, `No page called "${key}".`);
  return ok(read("pages")[key as PageKey]);
});

export const PUT = withUser(async (request, { params }: Context, user) => {
  const { key } = await params;
  const def = getPageDef(key);
  if (!def) return fail(404, `No page called "${key}".`);

  const body = await readJson(request);
  const errors = validatePage(key, body);
  const featured = key === "home" ? (body as PageContent | undefined)?.hero?.featuredProject : undefined;
  if (typeof featured === "string" && !read("projects").some((p) => p.slug === featured))
    errors.push("Hero: choose a project that exists.");
  if (errors.length) return fail(422, "Some fields need fixing.", errors);

  update({ user: user.name, action: "updated", target: `${def.title} page text`, href: `/page-text?page=${key}` }, (db) => {
    db.pages[key as PageKey] = body as PageContent;
  });
  return ok(read("pages")[key as PageKey]);
});
