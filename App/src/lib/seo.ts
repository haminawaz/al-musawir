import type { Metadata } from "next";
import type { Site } from "./types";

// Search and social metadata.
// Canonical URLs, og:url and the sitemap need the site's public address, so they are only emitted
// when SITE_URL is set (e.g. https://example.com). Without it they are left out rather than guessed.

let warned = false;

export function siteUrl(): URL | undefined {
  const value = process.env.SITE_URL?.trim();
  if (!value) {
    if (!warned && process.env.NODE_ENV === "production") {
      warned = true;
      console.warn("SITE_URL is not set: canonical URLs, og:url and sitemap entries are left out.");
    }
    return undefined;
  }
  try {
    return new URL(value);
  } catch {
    throw new Error(`SITE_URL is not a valid URL: "${value}". Use the full address, e.g. https://example.com.`);
  }
}

/** Title, description, canonical URL and social tags for one page. `title` is left out on the home page. */
export function pageMetadata({ site, title, description, path }: { site: Site; title?: string; description: string; path: string }): Metadata {
  const canonical = siteUrl() ? path : undefined;
  const fullTitle = title ? `${title} | ${site.name}` : site.seo.title;
  return {
    ...(title ? { title } : {}),
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description,
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: { card: "summary", title: fullTitle, description },
  };
}

/** Plain text for a meta description: one line, at most about 160 characters. */
export function describe(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
