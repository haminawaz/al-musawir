import type { Project } from "@/lib/types";
import { validateProject } from "@/lib/validate";
import { read, update } from "@/mock/db";
import { fail, ok, readJson, withUser } from "@/mock/http";

export const GET = withUser(() => ok(read("projects")));

export const POST = withUser(async (request, _context, user) => {
  const body = await readJson(request);
  const errors = validateProject(body, { categories: read("categories"), projects: read("projects") });
  if (errors.length) return fail(422, "Some fields need fixing.", errors);

  const project = body as Project;
  update({ user: user.name, action: "created", target: project.name, href: `/projects/${project.slug}` }, (db) => {
    db.projects.push(project);
  });
  return ok(project, 201);
});
