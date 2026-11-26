import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";

// Called by the backend after every save in the dashboard (its WEBSITE_REVALIDATE_URL), with the
// shared REVALIDATE_SECRET. Marks all cached content stale, so the next visit to any page gets fresh content.

export const dynamic = "force-dynamic";

function secretMatches(given: string | null) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET) return Response.json({ error: "Revalidation is not set up." }, { status: 404 });
  if (!secretMatches(request.headers.get("x-revalidate-secret"))) return Response.json({ error: "Wrong secret." }, { status: 401 });
  // expire: 0, so the next visitor waits for fresh content instead of seeing the old page once more.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
