import type { Metadata } from "next";
import { CategoriesEditor } from "./categories-editor";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return <CategoriesEditor />;
}
