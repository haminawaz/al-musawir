// Content types, as the backend's admin API (../backend, /api/admin) sends and accepts them.

export type Site = {
  name: string;
  tagline: string;
  /** Small label next to the logo in the header. */
  headerLabel: string;
  whatsappDisplay: string;
  /** Digits only, with country code, as used in https://wa.me/<number>. */
  whatsappNumber: string;
  hours: string;
  seo: { title: string; description: string };
};

export type NavLink = { href: string; label: string };

/** The website has one illustration per service id, so the four ids are fixed. */
export type ServiceId = "floor-plans" | "elevations" | "working-drawings" | "approval-drawings";

export type Service = { id: ServiceId; name: string; summary: string; deliverables: string };

export type ProcessStep = { title: string; text: string };

export type SurveySpec = { title: string; text: string };

export type Category = { id: string; label: string };

/**
 * All plan geometry is in feet. The origin is the rear-left corner of the plot:
 * x runs across the plot, y runs from the rear towards the road at the front.
 */
export type Room = {
  name: string;
  x: number;
  y: number;
  w: number;
  d: number;
  stairs?: boolean;
  /** Baseline of the room name on the plot map. Defaults to the room centre; size is in px (default 11). */
  label?: { x: number; y: number; size?: number };
};

export type OpeningRotation = 0 | 90 | 180 | -90;

export type Opening = {
  type: "door" | "window";
  x: number;
  y: number;
  /** 0 = wall runs across the plot. 90 / -90 = wall runs front to back. */
  rotate: OpeningRotation;
  width: number;
  entrance?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  city: string;
  society: string;
  client: string;
  plotNo: string;
  floors: string;
  drawingNo: string;
  scale: string;
  date: string;
  status: string;
  plot: {
    width: number;
    depth: number;
    road: number;
    setbacks: { front: number; rear: number; left: number; right: number };
  };
  rooms: Room[];
  openings: Opening[];
};

/** Text on the website's pages: page -> section -> field. Fields are text, lists of text, or label/value rows. */
export type PageKey =
  | "home"
  | "services"
  | "projects"
  | "projectDetail"
  | "survey"
  | "about"
  | "contact"
  | "footer"
  | "notFound";

export type Pair = { label: string; value: string };
export type FieldValue = string | string[] | Pair[];
export type PageContent = Record<string, Record<string, FieldValue>>;
export type Pages = Record<PageKey, PageContent>;

export type Activity = {
  id: string;
  at: string;
  user: string;
  action: "created" | "updated" | "deleted";
  target: string;
  /** Dashboard path to the thing that changed, when it still exists. */
  href?: string;
};

export type SessionUser = { email: string; name: string };

/** Everything the website needs, in one response (GET /api/content). */
export type SiteContent = {
  site: Site;
  navigation: NavLink[];
  services: Service[];
  processSteps: ProcessStep[];
  surveySpecs: SurveySpec[];
  categories: Category[];
  projects: Project[];
  pages: Pages;
};
