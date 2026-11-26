import type { Metadata } from "next";
import { getPageDef, pageDefs } from "@/lib/page-schema";
import { PageTextEditor } from "./page-text-editor";

export const metadata: Metadata = { title: "Page text" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const { page } = await searchParams;
  const key = typeof page === "string" && getPageDef(page) ? getPageDef(page)!.key : pageDefs[0].key;
  return <PageTextEditor pageKey={key} />;
}
