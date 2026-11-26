import type {
  Activity,
  Category,
  NavLink,
  PageContent,
  PageKey,
  ProcessStep,
  Project,
  SessionUser,
  Service,
  Site,
  SiteContent,
  SurveySpec,
} from "./types";

// The only place the dashboard's pages talk to the server.
// Requests go to /api on the dashboard's own domain, and src/app/api/[...path]/route.ts forwards them
// to the backend's admin API (API_URL). The browser never calls the backend directly, so the session
// cookie belongs to the dashboard's domain wherever the backend is hosted.

const BASE_URL = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: string[] = [],
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  const json = await response.json().catch(() => null);
  if (response.status === 401 && !path.startsWith("/auth/")) {
    // Session expired: back to sign-in, then return here.
    const next = encodeURIComponent(location.pathname + location.search);
    location.assign(`/login?next=${next}`);
  }
  if (!response.ok) throw new ApiError(json?.error ?? `Request failed (${response.status}).`, response.status, json?.details);
  return json?.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

/** Paths, with the type each one returns. */
export const endpoints = {
  login: "/auth/login",
  logout: "/auth/logout",
  me: "/auth/me",
  content: "/content",
  activity: "/activity",
  site: "/site",
  navigation: "/navigation",
  services: "/services",
  processSteps: "/process-steps",
  surveySpecs: "/survey-specs",
  categories: "/categories",
  projects: "/projects",
  project: (slug: string) => `/projects/${encodeURIComponent(slug)}`,
  page: (key: PageKey) => `/pages/${key}`,
} as const;

export type EndpointTypes = {
  site: Site;
  navigation: NavLink[];
  services: Service[];
  processSteps: ProcessStep[];
  surveySpecs: SurveySpec[];
  categories: Category[];
  projects: Project[];
  page: PageContent;
  content: SiteContent;
  activity: Activity[];
  me: { user: SessionUser };
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
