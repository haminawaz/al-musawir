import type { Activity, Project } from "@/lib/types";
import { validateProject } from "@/lib/validate";
import { read, update } from "@/mock/db";
import { fail, ok, readJson, withUser } from "@/mock/http";

type Context = { params: Promise<{ slug: string }> };

const notFound = (slug: string) => fail(404, `No project with the web address "${slug}".`);

export const GET = withUser(async (_request, { params }: Context) => {
  const { slug } = await params;
  const project = read("projects").find((p) => p.slug === slug);
  return project ? ok(project) : notFound(slug);
});

/** Replaces the project. The slug may change; the home page hero follows it. */
export const PUT = withUser(async (request, { params }: Context, user) => {
  const { slug } = await params;
  const projects = read("projects");
  if (!projects.some((p) => p.slug === slug)) return notFound(slug);

  const body = await readJson(request);
  const errors = validateProject(body, { categories: read("categories"), projects, originalSlug: slug });
  if (errors.length) return fail(422, "Some fields need fixing.", errors);

  const project = body as Project;
  update({ user: user.name, action: "updated", target: project.name, href: `/projects/${project.slug}` }, (db) => {
    db.projects = db.projects.map((p) => (p.slug === slug ? project : p));
    if (db.pages.home.hero.featuredProject === slug) db.pages.home.hero.featuredProject = project.slug;
    relinkActivity(db.activity, slug, `/projects/${project.slug}`);
  });
  return ok(project);
});

export const DELETE = withUser(async (_request, { params }: Context, user) => {
  const { slug } = await params;
  const project = read("projects").find((p) => p.slug === slug);
  if (!project) return notFound(slug);
  if (read("pages").home.hero.featuredProject === slug)
    return fail(409, "This plan is shown in the home page hero. Choose another plan there first (Page text › Home › Hero).");

  update({ user: user.name, action: "deleted", target: project.name }, (db) => {
    db.projects = db.projects.filter((p) => p.slug !== slug);
    relinkActivity(db.activity, slug, undefined);
  });
  return ok({ deleted: slug });
});

/** Older log entries follow a renamed project, and stop linking to a deleted one. */
function relinkActivity(activity: Activity[], oldSlug: string, href: string | undefined) {
  for (const a of activity) if (a.href === `/projects/${oldSlug}`) a.href = href;
}
