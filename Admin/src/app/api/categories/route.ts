import { validateCategories } from "@/lib/validate";
import { read } from "@/mock/db";
import { documentRoute } from "@/mock/http";

export const { GET, PUT } = documentRoute("categories", {
  label: "Categories",
  href: "/categories",
  validate: (body) => validateCategories(body, read("projects")),
});
