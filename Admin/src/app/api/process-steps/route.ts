import { validateTitledList } from "@/lib/validate";
import { documentRoute } from "@/mock/http";

export const { GET, PUT } = documentRoute("processSteps", {
  label: "Process steps",
  href: "/process",
  validate: (body) => validateTitledList(body, "Step", 8),
});
