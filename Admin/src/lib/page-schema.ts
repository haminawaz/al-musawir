import type { PageKey } from "./types";

// Describes every editable piece of page text on the website.
// The dashboard draws its forms from this, and the mock API validates against it.

export type FieldType =
  | "text"
  | "textarea"
  /** A list of short texts. */
  | "list"
  /** Rows of label + value. */
  | "pairs"
  /** The slug of a project. */
  | "project";

export type FieldDef = { key: string; label: string; type: FieldType; help?: string };

export type SectionDef = {
  key: string;
  title: string;
  description?: string;
  fields: FieldDef[];
};

export type PageDef = { key: PageKey; title: string; path: string; sections: SectionDef[] };

const accentHelp = "Shown after the heading in amber italic.";

/** Section heading as the website draws it: small label, heading, amber accent words. */
const heading = (opts: { label?: boolean; intro?: boolean } = {}): FieldDef[] => [
  ...(opts.label === false ? [] : [{ key: "label", label: "Label", type: "text" as const, help: "Small caps text above the heading." }]),
  { key: "title", label: "Heading", type: "text" },
  { key: "titleAccent", label: "Heading accent", type: "text", help: accentHelp },
  ...(opts.intro ? [{ key: "intro", label: "Intro", type: "textarea" as const }] : []),
];

export const pageDefs: PageDef[] = [
  {
    key: "home",
    title: "Home",
    path: "/",
    sections: [
      {
        key: "hero",
        title: "Hero",
        description: "The first screen of the home page.",
        fields: [
          { key: "eyebrow", label: "Label", type: "text" },
          { key: "title", label: "Headline", type: "text" },
          { key: "titleAccent", label: "Headline accent", type: "text", help: accentHelp },
          { key: "intro", label: "Intro", type: "textarea" },
          { key: "rotatingPrefix", label: "Text before the rotating words", type: "text" },
          { key: "rotatingWords", label: "Rotating words", type: "list", help: "Shown one at a time, highlighted." },
          { key: "rotatingSuffix", label: "Text after the rotating words", type: "text" },
          { key: "primaryCta", label: "WhatsApp button", type: "text" },
          { key: "secondaryCta", label: "Projects link", type: "text" },
          { key: "facts", label: "Facts under the buttons", type: "list" },
          { key: "featuredProject", label: "Plan shown in the hero", type: "project" },
        ],
      },
      {
        key: "marquee",
        title: "Scrolling text",
        description: "The two large lines that scroll under the hero. End each line with a separator so the loop joins up.",
        fields: [{ key: "lines", label: "Lines", type: "list" }],
      },
      {
        key: "servicesSection",
        title: "Services section",
        fields: [...heading({ intro: true }), { key: "linkLabel", label: "Link to all services", type: "text" }],
      },
      { key: "processSection", title: "Process section", fields: heading() },
      {
        key: "projectsSection",
        title: "Projects section",
        fields: [...heading({ intro: true }), { key: "linkLabel", label: "Link to all projects", type: "text" }],
      },
      {
        key: "surveySection",
        title: "Land survey section",
        fields: [...heading({ intro: true }), { key: "buttonLabel", label: "Button", type: "text" }],
      },
    ],
  },
  {
    key: "services",
    title: "Services",
    path: "/services",
    sections: [
      { key: "header", title: "Page header", fields: heading({ intro: true }) },
      {
        key: "cta",
        title: "Quote box",
        description: "The box at the bottom of the page.",
        fields: [
          { key: "title", label: "Heading", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
          { key: "buttonLabel", label: "Button", type: "text" },
          { key: "whatsappMessage", label: "WhatsApp message", type: "textarea", help: "Filled in when the visitor taps the button." },
        ],
      },
    ],
  },
  {
    key: "projects",
    title: "Projects",
    path: "/projects",
    sections: [
      { key: "header", title: "Page header", fields: heading({ intro: true }) },
      {
        key: "empty",
        title: "No projects in a size",
        description: "Shown when a plot size filter has no projects.",
        fields: [
          { key: "title", label: "Heading", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "projectDetail",
    title: "Project page",
    path: "/projects/…",
    sections: [
      {
        key: "actions",
        title: "Buttons",
        fields: [
          { key: "printButtonLabel", label: "Print button", type: "text" },
          { key: "askButtonLabel", label: "WhatsApp button", type: "text" },
          {
            key: "whatsappMessage",
            label: "WhatsApp message",
            type: "textarea",
            help: "{name} and {drawingNo} are replaced with the project's name and drawing number.",
          },
        ],
      },
      {
        key: "notes",
        title: "Drawing notes",
        description: "The numbered notes under the room schedule, on every project page.",
        fields: [{ key: "items", label: "Notes", type: "list" }],
      },
    ],
  },
  {
    key: "survey",
    title: "Land survey",
    path: "/survey",
    sections: [
      {
        key: "header",
        title: "Page header",
        fields: [
          ...heading({ intro: true }),
          { key: "buttonLabel", label: "Button", type: "text" },
          { key: "whatsappMessage", label: "WhatsApp message", type: "textarea" },
        ],
      },
      {
        key: "figure",
        title: "Boundary drawing",
        fields: [
          { key: "caption", label: "Caption", type: "text" },
          { key: "equipment", label: "Equipment note", type: "text" },
        ],
      },
    ],
  },
  {
    key: "about",
    title: "About",
    path: "/about",
    sections: [
      { key: "header", title: "Page header", fields: heading({ intro: true }) },
      {
        key: "atAGlance",
        title: "At a glance",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "rows", label: "Rows", type: "pairs" },
        ],
      },
      { key: "process", title: "How we work", description: "The steps themselves are edited under Process.", fields: heading() },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    path: "/contact",
    sections: [
      {
        key: "header",
        title: "Page header",
        fields: [
          ...heading({ intro: true }),
          { key: "buttonLabel", label: "WhatsApp button", type: "text" },
          { key: "replyTime", label: "Reply time", type: "text", help: "Shown in the details table next to WhatsApp and hours." },
        ],
      },
      {
        key: "form",
        title: "Contact form",
        fields: [
          { key: "plotSizes", label: "Plot size options", type: "list" },
          { key: "cityPlaceholder", label: "City placeholder", type: "text" },
          { key: "cityError", label: "City missing message", type: "text" },
          { key: "messagePlaceholder", label: "Message placeholder", type: "text" },
          { key: "helpText", label: "Note next to the button", type: "text" },
          { key: "submitLabel", label: "Send button", type: "text" },
        ],
      },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    path: "every page",
    sections: [
      {
        key: "cta",
        title: "Footer",
        fields: [
          { key: "eyebrow", label: "Label", type: "text" },
          { key: "title", label: "Heading", type: "text" },
          { key: "titleAccent", label: "Heading accent", type: "text", help: accentHelp },
          { key: "buttonLabel", label: "WhatsApp button", type: "text" },
          { key: "bottomLine", label: "Bottom line", type: "text", help: "Right side of the copyright line." },
        ],
      },
    ],
  },
  {
    key: "notFound",
    title: "Page not found",
    path: "404",
    sections: [
      {
        key: "content",
        title: "404 page",
        fields: [...heading(), { key: "text", label: "Text", type: "textarea" }],
      },
    ],
  },
];

export const pageKeys = pageDefs.map((p) => p.key);

export function getPageDef(key: string) {
  return pageDefs.find((p) => p.key === key);
}
