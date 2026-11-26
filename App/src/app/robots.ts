import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/** /robots.txt: everything public may be indexed; the revalidation endpoint may not. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(base ? { sitemap: new URL("/sitemap.xml", base).href, host: base.origin } : {}),
  };
}
