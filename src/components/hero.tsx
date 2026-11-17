"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { whatsappLink } from "@/data/site";
import { useMediaQuery } from "./motion";
import Crosshair from "./react-bits/Crosshair";
import DotGrid from "./react-bits/DotGrid";
import RotatingText from "./react-bits/RotatingText";
import SplitText from "./react-bits/SplitText";
import { ArrowIcon, buttonClass, Container, textLinkClass, WhatsAppIcon } from "./ui";

const plotTypes = ["5 Marla", "10 Marla", "1 Kanal", "commercial"];
const facts = ["PDF + DWG files", "Approval-ready sets", "Same-day reply"];

/**
 * Home page hero, styled like CAD model space: a springy dot grid, and on desktop a crosshair
 * cursor that reads out coordinates and measures the buttons it passes over.
 */
export function Hero({ drawing }: { drawing: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const desktop = useMediaQuery("(pointer: fine) and (min-width: 1024px)");

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 mask-[radial-gradient(ellipse_80%_70%_at_60%_40%,black_30%,transparent_75%)]"
      >
        <DotGrid
          dotSize={2}
          gap={26}
          baseColor="#2c3238"
          activeColor="#e5ae4b"
          proximity={130}
          strength={0.6}
          glow={0.4}
          shockStrength={2.5}
        />
      </div>
      {desktop && (
        <Crosshair
          containerRef={ref}
          color="#e5ae4b"
          opacity={0.42}
          lineStyle="dashed"
          gap={12}
          fade={0.35}
          clickPulse
        />
      )}

      <Container className="grid items-center gap-14 py-16 sm:py-20 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.25fr_0.75fr] lg:py-24">
        <div>
          <p className="eyebrow motion-safe:fade-up">Naqsha nawees · Land survey · Pakistan</p>
          <h1 className="mt-7 text-display">
            <SplitText text="Your plot, drawn" tag="span" splitType="chars" effect="rise" mask duration={0.9} delay={28} trigger="load" textAlign="left" />{" "}
            <SplitText
              text="to the last inch."
              tag="span"
              splitType="chars"
              effect="rise"
              mask
              duration={0.9}
              delay={28}
              trigger="load"
              textAlign="left"
              className="font-serif font-normal tracking-[-0.025em] text-accent italic"
            />
          </h1>
          <p
            className="mt-8 max-w-[46ch] text-lg text-muted motion-safe:fade-up"
            style={{ "--draw-delay": "0.5s" } as React.CSSProperties}
          >
            Residential and commercial plans, approval-ready drawings, and land survey for homeowners, builders and
            developers.
          </p>
          <div
            className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg motion-safe:fade-up"
            style={{ "--draw-delay": "0.6s" } as React.CSSProperties}
          >
            <span className="text-muted">Drawings for</span>
            <RotatingText
              texts={plotTypes}
              highlight
              highlightColor="#e5ae4b"
              mainClassName="font-mono text-base font-medium text-on-accent"
              rotationInterval={2400}
              effect="slide"
            />
            <span className="text-muted">plots</span>
          </div>
          <div
            className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 motion-safe:fade-up"
            style={{ "--draw-delay": "0.7s" } as React.CSSProperties}
          >
            <a href={whatsappLink()} className={buttonClass()}>
              <WhatsAppIcon className="size-5" />
              Get your plot drawn
            </a>
            <Link href="/projects" className={textLinkClass}>
              See projects
              <ArrowIcon className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
          <ul
            className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-[0.78rem] text-subtle motion-safe:fade-up"
            style={{ "--draw-delay": "0.85s" } as React.CSSProperties}
          >
            {facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        {drawing}
      </Container>
    </section>
  );
}
