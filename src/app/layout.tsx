import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-newsreader",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Al-Musawir | Naqsha nawees and land survey",
    template: "%s | Al-Musawir",
  },
  description:
    "Residential and commercial plans, approval-ready drawings, and land survey for homeowners, builders and developers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${instrumentSans.variable}`}>
      <body className="bg-paper font-sans text-[1.0625rem] leading-[1.6] text-ink print:bg-white">
        <SiteHeader />
        <main className="min-h-[70vh]">
          <div className="mx-auto max-w-[1080px] px-6">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
