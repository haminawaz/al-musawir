import type { Metadata } from "next";
import { SettingsEditor } from "./settings-editor";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsEditor />;
}
