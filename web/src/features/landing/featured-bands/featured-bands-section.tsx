"use client";

import { type KeyboardEvent, useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

import { FeaturedBandCard } from "./featured-band-card";
import { featuredBands } from "./featured-bands-data";

/** Fraction of the visible track width to advance per prev/next press or
 * arrow-key press — mirrors `featured-artists/featured-artists-section.tsx`
 * exactly, since it's the same interaction on a differently-sized card row,
 * not a new pattern that needs its own tuning. */
const SCROLL_STEP_RATIO = 0.85;

const VIEW_ALL_HREF = "/search?category=bands" as Route;

/**
 * "Featured Bands" — the next horizontal-scroll showcase after Featured
 * Artists, per this milestone's brief. Placed at the end of the existing
 * section stack; nothing above it is touched.
 *
 * Structurally this is the same proven carousel shell as
 * `FeaturedArtistsSection` (same `Container`, same scroll/snap/keyboard
 * mechanics, same prev/next chevrons) — reused deliberately rather than
 * reinvented, since a visitor who has already learned that interaction
 * shouldn't have to re-learn a second one two sections later. The
 * content-bearing parts (the card itself, its data, its category badge)
 * are what's genuinely new.
 */
export function FeaturedBandsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());

  function scrollByDirection(direction: 1 | -1) {
    const node = scrollerRef.current;
    if (!node) return;

    node.scrollBy({
      left: node.clientWidth * SCROLL_STEP_RATIO * direction,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function handleTrackKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByDirection(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByDirection(-1);
    }
  }

  return (
    <section
      aria-labelledby="featured-bands-title"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <Container width="wide">
        <header className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
              Featured Bands
            </p>
            <h2
              id="featured-bands-title"
              className="font-display text-foreground text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              A full stage, ready to book.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              From wedding stages to jazz clubs to twenty-drum Dhol Tasha processions —
              hand-picked bands with verified lineups, transparent pricing, and the track
              record to prove they show up ready to perform.
            </p>
          </div>

          <Button asChild variant="outline" className="hidden shrink-0 sm:inline-flex">
            <Link href={VIEW_ALL_HREF}>
              View All Bands
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <div className="relative">
          <div
            ref={scrollerRef}
            aria-label="Featured bands"
            tabIndex={0}
            onKeyDown={handleTrackKeyDown}
            className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto scroll-smooth px-5 pb-4 focus-visible:outline-none md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {featuredBands.map((band, index) => (
              <FeaturedBandCard
                key={band.name}
                band={band}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>

          {/* Prev/next controls — desktop/pointer-only affordance, kept
              subtly visible at rest rather than hover-only-hidden so a
              keyboard user tabbing to them can see what they're about to
              activate. Identical pattern to FeaturedArtistsSection. */}
          <div className="pointer-events-none absolute -inset-x-5 inset-y-0 hidden items-center justify-between lg:flex">
            <button
              type="button"
              aria-label="Scroll to previous bands"
              onClick={() => scrollByDirection(-1)}
              className="border-border/60 bg-background/90 text-foreground pointer-events-auto flex size-10 -translate-x-1/2 items-center justify-center rounded-full border opacity-70 shadow-md backdrop-blur-md transition-opacity hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Scroll to next bands"
              onClick={() => scrollByDirection(1)}
              className="border-border/60 bg-background/90 text-foreground pointer-events-auto flex size-10 translate-x-1/2 items-center justify-center rounded-full border opacity-70 shadow-md backdrop-blur-md transition-opacity hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Button asChild variant="outline">
            <Link href={VIEW_ALL_HREF}>
              View All Bands
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
