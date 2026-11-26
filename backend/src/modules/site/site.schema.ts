import { z } from "zod";
import { list, object, text } from "../../lib/validation.js";

const whatsappMessage = "WhatsApp number (link) must be 8 to 15 digits with the country code, no spaces or +, e.g. 923001234567.";

export const siteSchema = object(
  {
    name: text("Business name"),
    tagline: text("Tagline"),
    headerLabel: text("Header label", { required: false }),
    whatsappDisplay: text("WhatsApp number (shown)"),
    whatsappNumber: z.string({ error: whatsappMessage }).regex(/^\d{8,15}$/, { error: whatsappMessage }),
    hours: text("Opening hours"),
    seo: object({ title: text("Search title"), description: text("Search description") }, "SEO must be an object."),
  },
  "Site settings must be an object.",
);

export type SiteInput = z.output<typeof siteSchema>;

/** Labels and order can change; which pages are linked is checked against the database (see site.service.ts). */
export const navigationSchema = list(
  object(
    {
      href: z.string({ error: "Link {n} address must be text." }).max(200, { error: "Link {n} address is too long." }),
      label: text("Link {n} label", { max: 100 }),
    },
    "Link {n} must be an object.",
  ),
  "Navigation",
  1,
  20,
);

export type NavLinkInput = z.output<typeof navigationSchema>[number];
