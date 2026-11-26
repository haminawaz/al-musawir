// Content shapes, as the backend's public API (/api/v1) sends them.

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

/** The website has one illustration per service id. */
export type ServiceId = "floor-plans" | "elevations" | "working-drawings" | "approval-drawings";
export type Service = { id: ServiceId; name: string; summary: string; deliverables: string };

/** A process step or a land survey detail. */
export type TitledItem = { title: string; text: string };

export type Category = { id: string; label: string; projectCount: number };

/**
 * All plan geometry is in feet. The origin is the rear-left corner of the plot:
 * x runs across the plot, y runs from the rear towards the road at the front.
 */
export type Room = {
  name: string;
  /** Top-left corner of the room. */
  x: number;
  y: number;
  /** Clear internal size: w across the plot, d from rear to front. */
  w: number;
  d: number;
  /** Draws stair treads, one per foot. */
  stairs?: boolean;
  /** Baseline of the room name on the plot map. Defaults to the room centre; size is in px (default 11). */
  label?: { x: number; y: number; size?: number };
};

export type Opening = {
  type: "door" | "window";
  /** Centre of the opening, on a wall line. */
  x: number;
  y: number;
  /** 0 = wall runs across the plot. 90 / -90 = wall runs front to back. Doors swing towards -y before rotation. */
  rotate: 0 | 90 | 180 | -90;
  width: number;
  /** Labels this door "Entrance" on the plot map. */
  entrance?: boolean;
};

export type Plot = {
  width: number;
  depth: number;
  road: number;
  setbacks: { front: number; rear: number; left: number; right: number };
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
  plot: Plot;
  rooms: Room[];
  openings: Opening[];
};

/** A project card: the plan outline and its numbers, without doors, windows or title-block details. */
export type ProjectSummary = {
  slug: string;
  name: string;
  category: string;
  city: string;
  drawingNo: string;
  plot: Plot;
  rooms: Pick<Room, "name" | "x" | "y" | "w" | "d">[];
  /** Square feet. */
  plotArea: number;
  coveredArea: number;
};

export type ProjectPage = { project: Project; previous: ProjectSummary | null; next: ProjectSummary | null };

// --- Page text, edited in the dashboard (Page text). Field names match its page schema. ---

type Heading = { label: string; title: string; titleAccent: string };
type HeadingWithIntro = Heading & { intro: string };

export type PageTexts = {
  home: {
    hero: {
      eyebrow: string;
      title: string;
      titleAccent: string;
      intro: string;
      rotatingPrefix: string;
      rotatingWords: string[];
      rotatingSuffix: string;
      primaryCta: string;
      secondaryCta: string;
      facts: string[];
      /** Slug of the project whose plan is drawn in the hero. */
      featuredProject: string;
    };
    marquee: { lines: string[] };
    servicesSection: HeadingWithIntro & { linkLabel: string };
    processSection: Heading;
    projectsSection: HeadingWithIntro & { linkLabel: string };
    surveySection: HeadingWithIntro & { buttonLabel: string };
  };
  services: {
    header: HeadingWithIntro;
    cta: { title: string; text: string; buttonLabel: string; whatsappMessage: string };
  };
  projects: {
    header: HeadingWithIntro;
    empty: { title: string; text: string };
  };
  projectDetail: {
    actions: { printButtonLabel: string; askButtonLabel: string; whatsappMessage: string };
    notes: { items: string[] };
  };
  survey: {
    header: HeadingWithIntro & { buttonLabel: string; whatsappMessage: string };
    figure: { caption: string; equipment: string };
  };
  about: {
    header: HeadingWithIntro;
    atAGlance: { label: string; rows: { label: string; value: string }[] };
    process: Heading;
  };
  contact: {
    header: HeadingWithIntro & { buttonLabel: string; replyTime: string };
    form: {
      plotSizes: string[];
      cityPlaceholder: string;
      cityError: string;
      messagePlaceholder: string;
      helpText: string;
      submitLabel: string;
    };
  };
  footer: {
    cta: { eyebrow: string; title: string; titleAccent: string; buttonLabel: string; bottomLine: string };
  };
  notFound: {
    content: Heading & { text: string };
  };
};

export type PageKey = keyof PageTexts;
