import Link from "next/link";
import { Accent, ArrowIcon, buttonClass, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Container className="flex min-h-[70dvh] flex-col items-start justify-center py-24">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-6 max-w-[14ch] text-title">
          This page is <Accent>off the plot.</Accent>
        </h1>
        <p className="mt-6 max-w-[44ch] text-lg text-muted">
          The address may be mistyped, or the page has moved. Start again from the home page or see the projects.
        </p>
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
