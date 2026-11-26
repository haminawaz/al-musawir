import type { DbClient } from "../../db/client.js";
import { listCategories } from "../categories/categories.service.js";
import { listPages } from "../pages/pages.service.js";
import { listProjects } from "../projects/projects.service.js";
import { listServices } from "../services/services.service.js";
import { getSite, listNavigation } from "../site/site.service.js";
import { listProcessSteps, listSurveySpecs } from "../titled-lists/titled-lists.service.js";

/**
 * Everything at once, for the dashboard overview (counts, placeholder text check).
 * Admin only: the public website reads the smaller /api/v1 endpoints instead.
 */
export async function getAllContent(client: DbClient) {
  const [site, navigation, services, processSteps, surveySpecs, categories, projects, pages] = await Promise.all([
    getSite(client),
    listNavigation(client),
    listServices(client),
    listProcessSteps(client),
    listSurveySpecs(client),
    listCategories(client),
    listProjects(client),
    listPages(client),
  ]);
  return { site, navigation, services, processSteps, surveySpecs, categories, projects, pages };
}
