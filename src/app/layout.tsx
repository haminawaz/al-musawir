import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/data/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

const description =
  "Residential and commercial plans, approval-ready drawings, and land survey for homeowners, builders and developers.";

export const metadata: Metadata = {
  title: {
    default: "Al-Musawir | Naqsha nawees and land survey",
    template: "%s | Al-Musawir",
  },
  description,
  openGraph: {
    siteName: site.name,
    title: "Al-Musawir | Naqsha nawees and land survey",
    description,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body className="bg-canvas font-sans text-[1.0625rem] leading-relaxed text-fg antialiased">
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-accent px-4 py-2 font-medium text-on-accent transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 bg-grain opacity-[0.035] print:hidden" />
      </body>
    </html>
  );
}
