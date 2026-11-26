import type { Metadata } from "next";
import { SurveyEditor } from "./survey-editor";

export const metadata: Metadata = { title: "Land survey" };

export default function Page() {
  return <SurveyEditor />;
}
