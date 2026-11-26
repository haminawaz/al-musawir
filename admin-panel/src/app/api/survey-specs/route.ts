import { validateTitledList } from "@/lib/validate";
import { documentRoute } from "@/mock/http";

export const { GET, PUT } = documentRoute("surveySpecs", {
  label: "Land survey details",
  href: "/survey",
  validate: (body) => validateTitledList(body, "Detail", 12),
});
