import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPage, getSite } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

/** Search title and description come from the dashboard (Settings › Search listing). Pages add their own. */
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSite();
  const base = siteUrl();
  return {
    ...(base ? { metadataBase: base } : {}),
    title: { default: site.seo.title, template: `%s | ${site.name}` },
    description: site.seo.description,
    applicationName: site.name,
    openGraph: { siteName: site.name, title: site.seo.title, description: site.seo.description, type: "website" },
    twitter: { card: "summary", title: site.seo.title, description: site.seo.description },
  };
}

export const viewport: Viewport = { themeColor: "#0f1113", colorScheme: "dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ site, navigation }, footer] = await Promise.all([getSite(), getPage("footer")]);

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body className="bg-canvas font-sans text-[1.0625rem] leading-relaxed text-fg antialiased">
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-accent px-4 py-2 font-medium text-on-accent transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader site={site} navigation={navigation} />
        <main id="main">{children}</main>
        <SiteFooter site={site} navigation={navigation} text={footer.cta} />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 bg-grain opacity-[0.035] print:hidden" />
      </body>
    </html>
  );
}
