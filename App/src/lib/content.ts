import { notFound } from "next/navigation";
import type { Category, NavLink, PageKey, PageTexts, ProjectPage, ProjectSummary, Service, Site, TitledItem } from "./types";

// Reads the website's content from the backend's public API (API_URL/api/v1). Server-side only.
//
// Every response is cached by Next.js and tagged "content". Pages are therefore static: visitors get
// cached HTML, and the backend is asked again only when:
//   - the backend reports a change (POST /api/revalidate, see src/app/api/revalidate/route.ts), or
//   - CONTENT_REVALIDATE_SECONDS have passed (a fallback when the backend cannot reach this site).
// If the backend is down, visitors keep getting the last good pages.

export const CONTENT_TAG = "content";

const revalidate = Number(process.env.CONTENT_REVALIDATE_SECONDS) || 300;

function apiBase(): string {
  const value = process.env.API_URL?.trim() || (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");
  if (!value) throw new Error("API_URL is not set. Set it to the backend's address, e.g. https://api.example.com.");
  return `${new URL(value).origin}/api/v1`;
}

class NotFoundError extends Error {}

async function get<T>(path: string): Promise<T> {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate, tags: [CONTENT_TAG] },
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}: ${await res.text().catch(() => "")}`.slice(0, 500));
  return ((await res.json()) as { data: T }).data;
}

export const getSite = () => get<{ site: Site; navigation: NavLink[] }>("/site");
export const getServices = () => get<Service[]>("/services");
export const getProcessSteps = () => get<TitledItem[]>("/process-steps");
export const getSurveySpecs = () => get<TitledItem[]>("/survey-specs");
export const getCategories = () => get<Category[]>("/categories");
export const getProjects = () => get<ProjectSummary[]>("/projects");
export const getProjectSlugs = () => get<{ slug: string }[]>("/projects/slugs");
export const getPage = <K extends PageKey>(key: K) => get<PageTexts[K]>(`/pages/${key}`);

/** One project with its neighbours, or null when it does not exist. */
export async function findProjectPage(slug: string): Promise<ProjectPage | null> {
  try {
    return await get<ProjectPage>(`/projects/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

/** One project with its neighbours. Shows the 404 page when the project does not exist. */
export async function getProjectPage(slug: string): Promise<ProjectPage> {
  return (await findProjectPage(slug)) ?? notFound();
}
