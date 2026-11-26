import cors from "cors";
import { Router } from "express";
import { env } from "../config/env.js";
import { readDb } from "../db/client.js";
import { cachePublicResponses } from "../middleware/public-cache.js";
import { publicRateLimit } from "../middleware/rate-limit.js";
import { allowReadsOnly } from "../middleware/read-only.js";
import { parseOrThrow, routeParam } from "../middleware/validate.js";
import { listCategoriesWithCounts } from "../modules/categories/categories.service.js";
import { getPage } from "../modules/pages/pages.service.js";
import { getProjectWithNeighbours, listProjectSlugs, listProjectSummaries } from "../modules/projects/projects.queries.js";
import { projectListQuerySchema, slugParamSchema } from "../modules/projects/projects.schema.js";
import { listServices } from "../modules/services/services.service.js";
import { getSite, listNavigation } from "../modules/site/site.service.js";
import { listProcessSteps, listSurveySpecs } from "../modules/titled-lists/titled-lists.service.js";

// Public website API, mounted at /api/v1. No sign-in, and strictly read-only:
//   1. allowReadsOnly refuses every method except GET/HEAD/OPTIONS with 405, before anything else runs
//   2. only GET routes are defined, and no body parser is mounted
//   3. every query goes through readDb, whose database connections are read-only (src/db/client.ts)
//
// Each endpoint returns what one part of the website needs, instead of one response with everything.

const ok = <T>(data: T) => ({ data });

export function publicRouter() {
  const router = Router();

  router.use(allowReadsOnly);
  router.use(
    cors({
      origin: env.PUBLIC_CORS_ORIGINS.includes("*") ? "*" : env.PUBLIC_CORS_ORIGINS,
      methods: ["GET", "HEAD", "OPTIONS"],
      credentials: false,
      maxAge: 86_400,
    }),
  );
  router.use(publicRateLimit, cachePublicResponses);

  /** Header, footer, SEO and WhatsApp: what every page's layout needs. */
  router.get("/site", async (_req, res) => {
    const [site, navigation] = await Promise.all([getSite(readDb), listNavigation(readDb)]);
    res.json(ok({ site, navigation }));
  });

  router.get("/services", async (_req, res) => res.json(ok(await listServices(readDb))));
  router.get("/process-steps", async (_req, res) => res.json(ok(await listProcessSteps(readDb))));
  router.get("/survey-specs", async (_req, res) => res.json(ok(await listSurveySpecs(readDb))));
  router.get("/categories", async (_req, res) => res.json(ok(await listCategoriesWithCounts(readDb))));

  /** Project cards. ?category=<id> filters, ?limit=<1-100> caps the count (e.g. the home page). */
  router.get("/projects", async (req, res) => {
    const query = parseOrThrow(projectListQuerySchema, req.query, "Check the query string.");
    res.json(ok(await listProjectSummaries(readDb, query)));
  });

  /** Web addresses only, for generateStaticParams and sitemaps. Defined before /projects/:slug. */
  router.get("/projects/slugs", async (_req, res) => res.json(ok(await listProjectSlugs(readDb))));

  /** One full project with its plan, plus the previous and next projects. */
  router.get("/projects/:slug", async (req, res) => {
    const slug = parseOrThrow(slugParamSchema, routeParam(req, "slug"), "Check the web address.");
    res.json(ok(await getProjectWithNeighbours(readDb, slug)));
  });

  /** Text of one page: home, services, projects, projectDetail, survey, about, contact, footer, notFound. */
  router.get("/pages/:key", async (req, res) => res.json(ok(await getPage(readDb, routeParam(req, "key")))));

  return router;
}
