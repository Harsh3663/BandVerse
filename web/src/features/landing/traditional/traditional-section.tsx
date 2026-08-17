"use client";

import { useReducedMotion } from "framer-motion";

import { Container } from "@/components/layout/container";

import { TraditionalPerformerCard } from "./traditional-card";
import { traditionalPerformers } from "./traditional-data";

/**
 * "Traditional Performers Spotlight" — docs/LandingPageExperience.md § 3.4.
 * Per that doc, this is "the single most differentiated, emotionally
 * resonant section on the page" and gets more vertical breathing room
 * (`space-24`-equivalent, i.e. `py-24` at desktop) than its neighbors as a
 * deliberate hierarchy signal.
 *
 * The Spotlight Glow radial gradient behind the header reuses the exact
 * recipe from `hero-background.tsx` (`bg-gold-500` + heavy blur) at much
 * lower opacity for a light surface — per the doc, this gradient is only
 * meant to reappear in two places beyond the Hero, and this is one of them.
 */
export function TraditionalSection() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      aria-labelledby="traditional-spotlight-title"
      className="bg-background relative overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="bg-gold-500/10 dark:bg-gold-500/15 pointer-events-none absolute top-0 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
      />

      <Container width="wide" className="relative">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-gold-600 dark:text-gold-500 mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
            Traditional Performers Spotlight
          </p>
          <h2
            id="traditional-spotlight-title"
            className="font-display text-foreground text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
          >
            Celebrate tradition. Book the real thing.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            Long before booking platforms existed, Dhol Tasha troupes filled streets with
            rhythm, banjo bands led processions late into the night, and folk singers
            carried stories across generations. BandVerse is the first place that gives
            these living traditions the same visibility, transparent pricing, and booking
            confidence as any other act.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {traditionalPerformers.map((performer, index) => (
            <TraditionalPerformerCard
              key={performer.name}
              performer={performer}
              index={index}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
