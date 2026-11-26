import type { Metadata } from "next";
import { ProcessEditor } from "./process-editor";

export const metadata: Metadata = { title: "Process" };

export default function Page() {
  return <ProcessEditor />;
}
