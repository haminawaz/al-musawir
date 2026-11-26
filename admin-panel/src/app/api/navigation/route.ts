import type { NavLink } from "@/lib/types";
import { validateNavigation } from "@/lib/validate";
import { documentRoute } from "@/mock/http";

export const { GET, PUT } = documentRoute("navigation", {
  label: "Navigation",
  href: "/settings",
  validate: (body, current: NavLink[]) => validateNavigation(body, current),
});
