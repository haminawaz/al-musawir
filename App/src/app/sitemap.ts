import type { MetadataRoute } from "next";
import { getProjectSlugs, getSite } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

/**
 * /sitemap.xml: the menu's pages and every project, refreshed with the content.
 * Sitemap entries must be absolute URLs, so it stays empty until SITE_URL is set.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  if (!base) return [];
  const [{ navigation }, projects] = await Promise.all([getSite(), getProjectSlugs()]);
  return [
    ...navigation.map(({ href }) => ({
      url: new URL(href, base).href,
      changeFrequency: "monthly" as const,
      priority: href === "/" ? 1 : 0.8,
    })),
    ...projects.map(({ slug, updatedAt }) => ({
      url: new URL(`/projects/${slug}`, base).href,
      lastModified: new Date(updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
