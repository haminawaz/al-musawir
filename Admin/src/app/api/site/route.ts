import { validateSite } from "@/lib/validate";
import { documentRoute } from "@/mock/http";

export const { GET, PUT } = documentRoute("site", { label: "Site settings", href: "/settings", validate: validateSite });
