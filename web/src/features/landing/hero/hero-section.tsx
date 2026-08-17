"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { useMediaQuery } from "@/hooks/use-media-query";

import { HeroBackground } from "./hero-background";
import { HeroContent, HeroPerformerLink } from "./hero-content";
import { HeroScrollIndicator } from "./hero-scroll-indicator";
import { HeroSearch } from "./hero-search";
import { useHeroParallax } from "./use-hero-parallax";

/**
 * Entrance-sequence delays (seconds), verbatim from docs/
 * LandingPageExperience.md § Hero > Animation (Entrance Sequence) — the
 * single source of truth every child component's `delay` prop reads from,
 * so the choreography can never drift out of sync between components.
 */
const HERO_TIMING = {
  eyebrow: 0.4,
  headline: 0.55,
  subheadline: 0.75,
  search: 0.9,
  performerLink: 1.05,
  scrollIndicator: 1.2,
} as const;

const MOUSE_PARALLAX_MAX_PX = 14;

/**
 * BandVerse landing page — Hero section.
 *
 * This is the ONLY section built in this milestone; see docs/
 * LandingPageExperience.md for the full page (Trust Strip, Nearby Artists,
 * Traditional Performers Spotlight, etc.), which remain future milestones.
 *
 * Composition (all "supporting Hero components", none reused outside this
 * feature except generic primitives from the shared component library):
 * - HeroBackground   — cinematic image crossfade, scrim, spotlight glow, parallax
 * - HeroContent      — eyebrow / headline / subheadline
 * - HeroSearch        — the glass search pill (primary CTA)
 * - HeroPerformerLink — quiet secondary "I'm a performer" link
 * - HeroScrollIndicator — pulsing scroll cue
 *
 * `useReducedMotion` is read once here and threaded down as a plain prop —
 * every child branches on it individually, but there's a single source of
 * truth rather than five redundant `matchMedia` subscriptions.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = Boolean(useReducedMotion());

  // Mouse parallax only makes sense for actual mice/trackpads — skip it on
  // touch devices, where there's no persistent pointer to react to.
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const parallax = useHeroParallax(
    MOUSE_PARALLAX_MAX_PX,
    !reduceMotion && hasFinePointer,
  );

  return (
    <section
      ref={sectionRef}
      aria-label="BandVerse — discover, perform, connect"
      className="relative flex min-h-[92svh] items-center justify-center overflow-hidden bg-neutral-900 lg:min-h-svh"
    >
      <HeroBackground
        sectionRef={sectionRef}
        parallaxX={parallax.x}
        parallaxY={parallax.y}
        reduceMotion={reduceMotion}
      />

      <Container
        width="narrow"
        className="relative z-10 flex flex-col items-center gap-8 py-28 text-center sm:py-32"
      >
        <HeroContent
          reduceMotion={reduceMotion}
          eyebrowDelay={HERO_TIMING.eyebrow}
          headlineDelay={HERO_TIMING.headline}
          subheadlineDelay={HERO_TIMING.subheadline}
        />

        <div className="flex w-full flex-col items-center gap-4">
          <HeroSearch reduceMotion={reduceMotion} delay={HERO_TIMING.search} />
          <HeroPerformerLink
            reduceMotion={reduceMotion}
            delay={HERO_TIMING.performerLink}
          />
        </div>
      </Container>

      <HeroScrollIndicator
        sectionRef={sectionRef}
        reduceMotion={reduceMotion}
        delay={HERO_TIMING.scrollIndicator}
      />
    </section>
  );
}
