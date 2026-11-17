export type ServiceId = "floor-plans" | "elevations" | "working-drawings" | "approval-drawings";

export const services: { id: ServiceId; name: string; summary: string; deliverables: string }[] = [
  {
    id: "floor-plans",
    name: "Floor plans",
    summary: "Room layouts fitted to your plot size and your family's needs.",
    deliverables: "Dimensioned plan with room sizes, doors, windows and furniture positions",
  },
  {
    id: "elevations",
    name: "Elevations and sections",
    summary: "Front views and cut-throughs, clear enough for your contractor to build from.",
    deliverables: "Front, side and rear elevations plus key sections",
  },
  {
    id: "working-drawings",
    name: "Working drawings",
    summary: "Full dimensions and construction details for the site team.",
    deliverables: "Door and window schedule, wall details, plumbing and electrical layouts",
  },
  {
    id: "approval-drawings",
    name: "Approval drawings",
    summary: "Sets prepared to the format your development authority or housing society asks for.",
    deliverables: "Submission set with title block, area statement and setbacks",
  },
];

/** How a job runs, from first message to final files. Each step restates what the services and survey pages promise. */
export const processSteps = [
  { title: "Send your plot", text: "Plot size and city on WhatsApp. We reply the same day." },
  { title: "Measure the site", text: "Boundary and levels with Total Station and GPS, when the site needs a survey." },
  { title: "Draw", text: "Floor plans, elevations, working and approval drawings fitted to your plot." },
  { title: "Receive files", text: "PDF for review and DWG for your engineer." },
];

export const surveySpecs: [string, string][] = [
  ["Boundary demarcation", "Plot corners marked and measured against your documents."],
  ["Topographic survey", "Levels and contours for sloped or uneven sites."],
  ["Equipment", "Total Station and GPS."],
  ["You receive", "PDF plan and DWG file."],
];
