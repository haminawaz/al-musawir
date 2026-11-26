import type { Metadata } from "next";
import { ServicesEditor } from "./services-editor";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <ServicesEditor />;
}
