import { validateServices } from "@/lib/validate";
import { documentRoute } from "@/mock/http";

export const { GET, PUT } = documentRoute("services", { label: "Services", href: "/services", validate: validateServices });
