// Every editable piece of page text on the website: page -> sections -> fields.
// A copy of the structure in admin-panel/src/lib/page-schema.ts (keys, labels, field types).
// When a field is added there, add it here too, or the API will drop it on save.

export type FieldType = "text" | "textarea" | "list" | "pairs" | "project";
export type FieldDef = { key: string; label: string; type: FieldType };
export type SectionDef = { key: string; title: string; fields: FieldDef[] };
export type PageDef = { key: string; title: string; sections: SectionDef[] };

const f = (key: string, label: string, type: FieldType = "text"): FieldDef => ({ key, label, type });

/** A section heading as the website draws it: small label, heading, amber accent words. */
const heading = ({ label = true, intro = false } = {}): FieldDef[] => [
  ...(label ? [f("label", "Label")] : []),
  f("title", "Heading"),
  f("titleAccent", "Heading accent"),
  ...(intro ? [f("intro", "Intro", "textarea")] : []),
];

export const pageDefs = [
  {
    key: "home",
    title: "Home",
    sections: [
      {
        key: "hero",
        title: "Hero",
        fields: [
          f("eyebrow", "Label"),
          f("title", "Headline"),
          f("titleAccent", "Headline accent"),
          f("intro", "Intro", "textarea"),
          f("rotatingPrefix", "Text before the rotating words"),
          f("rotatingWords", "Rotating words", "list"),
          f("rotatingSuffix", "Text after the rotating words"),
          f("primaryCta", "WhatsApp button"),
          f("secondaryCta", "Projects link"),
          f("facts", "Facts under the buttons", "list"),
          f("featuredProject", "Plan shown in the hero", "project"),
        ],
      },
      { key: "marquee", title: "Scrolling text", fields: [f("lines", "Lines", "list")] },
      { key: "servicesSection", title: "Services section", fields: [...heading({ intro: true }), f("linkLabel", "Link to all services")] },
      { key: "processSection", title: "Process section", fields: heading() },
      { key: "projectsSection", title: "Projects section", fields: [...heading({ intro: true }), f("linkLabel", "Link to all projects")] },
      { key: "surveySection", title: "Land survey section", fields: [...heading({ intro: true }), f("buttonLabel", "Button")] },
    ],
  },
  {
    key: "services",
    title: "Services",
    sections: [
      { key: "header", title: "Page header", fields: heading({ intro: true }) },
      {
        key: "cta",
        title: "Quote box",
        fields: [f("title", "Heading"), f("text", "Text", "textarea"), f("buttonLabel", "Button"), f("whatsappMessage", "WhatsApp message", "textarea")],
      },
    ],
  },
  {
    key: "projects",
    title: "Projects",
    sections: [
      { key: "header", title: "Page header", fields: heading({ intro: true }) },
      { key: "empty", title: "No projects in a size", fields: [f("title", "Heading"), f("text", "Text", "textarea")] },
    ],
  },
  {
    key: "projectDetail",
    title: "Project page",
    sections: [
      {
        key: "actions",
        title: "Buttons",
        fields: [f("printButtonLabel", "Print button"), f("askButtonLabel", "WhatsApp button"), f("whatsappMessage", "WhatsApp message", "textarea")],
      },
      { key: "notes", title: "Drawing notes", fields: [f("items", "Notes", "list")] },
    ],
  },
  {
    key: "survey",
    title: "Land survey",
    sections: [
      {
        key: "header",
        title: "Page header",
        fields: [...heading({ intro: true }), f("buttonLabel", "Button"), f("whatsappMessage", "WhatsApp message", "textarea")],
      },
      { key: "figure", title: "Boundary drawing", fields: [f("caption", "Caption"), f("equipment", "Equipment note")] },
    ],
  },
  {
    key: "about",
    title: "About",
    sections: [
      { key: "header", title: "Page header", fields: heading({ intro: true }) },
      { key: "atAGlance", title: "At a glance", fields: [f("label", "Label"), f("rows", "Rows", "pairs")] },
      { key: "process", title: "How we work", fields: heading() },
    ],
  },
  {
    key: "contact",
    title: "Contact",
    sections: [
      { key: "header", title: "Page header", fields: [...heading({ intro: true }), f("buttonLabel", "WhatsApp button"), f("replyTime", "Reply time")] },
      {
        key: "form",
        title: "Contact form",
        fields: [
          f("plotSizes", "Plot size options", "list"),
          f("cityPlaceholder", "City placeholder"),
          f("cityError", "City missing message"),
          f("messagePlaceholder", "Message placeholder"),
          f("helpText", "Note next to the button"),
          f("submitLabel", "Send button"),
        ],
      },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    sections: [
      {
        key: "cta",
        title: "Footer",
        fields: [f("eyebrow", "Label"), f("title", "Heading"), f("titleAccent", "Heading accent"), f("buttonLabel", "WhatsApp button"), f("bottomLine", "Bottom line")],
      },
    ],
  },
  {
    key: "notFound",
    title: "Page not found",
    sections: [{ key: "content", title: "404 page", fields: [...heading(), f("text", "Text", "textarea")] }],
  },
] as const satisfies readonly PageDef[];

export type PageKey = (typeof pageDefs)[number]["key"];

export const pageKeys = pageDefs.map((p) => p.key) as PageKey[];

export const getPageDef = (key: string): PageDef | undefined => pageDefs.find((p) => p.key === key);

export const isPageKey = (key: string): key is PageKey => pageKeys.includes(key as PageKey);
