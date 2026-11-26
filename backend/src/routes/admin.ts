import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Router, type RequestHandler } from "express";
import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { notFound } from "../lib/errors.js";
import { notifyWebsite } from "../lib/website-revalidation.js";
import { currentAdmin, requireAuth } from "../middleware/auth.js";
import { publicCache } from "../middleware/public-cache.js";
import { adminRateLimit } from "../middleware/rate-limit.js";
import { noStore, requireJsonBody, requireTrustedOrigin } from "../middleware/request-guards.js";
import { parseOrThrow, routeParam, validateBody } from "../middleware/validate.js";
import { listActivity } from "../modules/activity/activity.service.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { categoriesSchema } from "../modules/categories/categories.schema.js";
import { listCategories, replaceCategories } from "../modules/categories/categories.service.js";
import { getAllContent } from "../modules/content/content.service.js";
import { pageSchema } from "../modules/pages/pages.schema.js";
import { getPage, listPages, replacePage } from "../modules/pages/pages.service.js";
import { projectSchema, slugParamSchema } from "../modules/projects/projects.schema.js";
import { createProject, deleteProject, getProject, listProjects, updateProject } from "../modules/projects/projects.service.js";
import { servicesSchema } from "../modules/services/services.schema.js";
import { listServices, updateServices } from "../modules/services/services.service.js";
import { navigationSchema, siteSchema } from "../modules/site/site.schema.js";
import { getSite, listNavigation, updateNavigation, updateSite } from "../modules/site/site.service.js";
import { processStepsSchema, surveySpecsSchema } from "../modules/titled-lists/titled-lists.schema.js";
import {
  listProcessSteps,
  listSurveySpecs,
  replaceProcessSteps,
  replaceSurveySpecs,
} from "../modules/titled-lists/titled-lists.service.js";

// Admin API, mounted at /api/admin. Everything except sign-in needs the admin's session cookie.
// Paths and JSON match the dashboard's mock API (admin-panel/README.md, "API contract"), so the
// dashboard switches over by setting NEXT_PUBLIC_API_URL to <this server>/api/admin.

/**
 * After any successful change: clear the public API cache and tell the website to refresh,
 * so the change shows on the website straight away.
 */
const publishChangesAfterWrites: RequestHandler = (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      publicCache.clear();
      notifyWebsite();
    });
  }
  next();
};

const ok = <T>(data: T) => ({ data });

export function adminRouter() {
  const router = Router();

  router.use(
    cors({
      origin: env.ADMIN_CORS_ORIGINS,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"],
      maxAge: 600,
    }),
  );
  router.use(noStore, adminRateLimit, requireTrustedOrigin(env.ADMIN_CORS_ORIGINS), requireJsonBody);
  router.use(express.json({ limit: env.BODY_LIMIT, strict: true }), cookieParser());

  router.use("/auth", authRoutes);

  // Everything below needs a signed-in admin.
  router.use(requireAuth, publishChangesAfterWrites);

  router.get("/content", async (_req, res) => res.json(ok(await getAllContent(db))));
  router.get("/activity", async (_req, res) => res.json(ok(await listActivity(db))));

  router.get("/site", async (_req, res) => res.json(ok(await getSite(db))));
  router.put("/site", validateBody(siteSchema), async (req, res) => res.json(ok(await updateSite(req.body, currentAdmin(req)))));

  router.get("/navigation", async (_req, res) => res.json(ok(await listNavigation(db))));
  router.put("/navigation", validateBody(navigationSchema), async (req, res) =>
    res.json(ok(await updateNavigation(req.body, currentAdmin(req)))),
  );

  router.get("/services", async (_req, res) => res.json(ok(await listServices(db))));
  router.put("/services", validateBody(servicesSchema), async (req, res) =>
    res.json(ok(await updateServices(req.body, currentAdmin(req)))),
  );

  router.get("/process-steps", async (_req, res) => res.json(ok(await listProcessSteps(db))));
  router.put("/process-steps", validateBody(processStepsSchema), async (req, res) =>
    res.json(ok(await replaceProcessSteps(req.body, currentAdmin(req)))),
  );

  router.get("/survey-specs", async (_req, res) => res.json(ok(await listSurveySpecs(db))));
  router.put("/survey-specs", validateBody(surveySpecsSchema), async (req, res) =>
    res.json(ok(await replaceSurveySpecs(req.body, currentAdmin(req)))),
  );

  router.get("/categories", async (_req, res) => res.json(ok(await listCategories(db))));
  router.put("/categories", validateBody(categoriesSchema), async (req, res) =>
    res.json(ok(await replaceCategories(req.body, currentAdmin(req)))),
  );

  router.get("/projects", async (_req, res) => res.json(ok(await listProjects(db))));
  router.post("/projects", validateBody(projectSchema), async (req, res) =>
    res.status(201).json(ok(await createProject(req.body, currentAdmin(req)))),
  );
  router.get("/projects/:slug", async (req, res) => res.json(ok(await getProject(db, routeParam(req, "slug")))));
  router.put("/projects/:slug", validateBody(projectSchema), async (req, res) =>
    res.json(ok(await updateProject(routeParam(req, "slug"), req.body, currentAdmin(req)))),
  );
  router.delete("/projects/:slug", async (req, res) =>
    res.json(ok(await deleteProject(parseOrThrow(slugParamSchema, routeParam(req, "slug")), currentAdmin(req)))),
  );

  router.get("/pages", async (_req, res) => res.json(ok(await listPages(db))));
  router.get("/pages/:key", async (req, res) => res.json(ok(await getPage(db, routeParam(req, "key")))));
  router.put("/pages/:key", async (req, res) => {
    const key = routeParam(req, "key");
    const schema = pageSchema(key);
    if (!schema) throw notFound(`No page called "${key}".`);
    res.json(ok(await replacePage(key, parseOrThrow(schema, req.body), currentAdmin(req))));
  });

  return router;
}
