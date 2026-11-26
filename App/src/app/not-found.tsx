import type { Metadata } from "next";
import Link from "next/link";
import { AccentTitle, ArrowIcon, buttonClass, Container } from "@/components/ui";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default async function NotFound() {
  const { content: text } = await getPage("notFound");

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Container className="flex min-h-[70dvh] flex-col items-start justify-center py-24">
        <p className="eyebrow">{text.label}</p>
        <h1 className="mt-6 max-w-[14ch] text-title">
          <AccentTitle text={text} />
        </h1>
        <p className="mt-6 max-w-[44ch] text-lg text-muted">{text.text}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonClass()}>
            Home
          </Link>
          <Link href="/projects" className={buttonClass("secondary")}>
            Projects
            <ArrowIcon />
          </Link>
        </div>
      </Container>
    </section>
  );
}
