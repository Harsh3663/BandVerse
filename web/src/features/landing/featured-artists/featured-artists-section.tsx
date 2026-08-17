"use client";

import { type KeyboardEvent, useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

import { FeaturedArtistCard } from "./featured-artist-card";
import { featuredArtists } from "./featured-artists-data";

/** Fraction of the visible track width to advance per prev/next press or
 * arrow-key press — under 1 so the trailing edge of the previous view stays
 * visible, giving continuity of place rather than a jarring full reset. */
const SCROLL_STEP_RATIO = 0.85;

const VIEW_ALL_HREF = "/search?sort=featured" as Route;

/**
 * "Featured Artists" — docs/InformationArchitecture.md § 4 ("a curated,
 * editorially-vetted showcase... a chance to demonstrate the platform's
 * range and quality bar deliberately, not algorithmically") and
 * docs/LandingPageExperience.md § 3.3.
 *
 * Placed directly after the already-shipped Traditional Performers
 * Spotlight, per this milestone's brief — the canonical IA ordering has
 * Featured Artists before the Traditional section, but nothing in the
 * "don't touch completed sections" constraint permits reordering
 * `app/page.tsx`'s existing sections, so this is additive at the end.
 *
 * Reuses the exact horizontal-scroll-row pattern already established by
 * `TraditionalSection`/`CategoriesSection` (same `Container`, same card
 * entrance stagger) rather than inventing a new one, per doc: "by this point
 * in the scroll, the visitor has fully learned the... interaction pattern,
 * so it can be reused efficiently without re-explaining itself."
 */
export function FeaturedArtistsSection() {
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

  // Arrow-key scrolling for the row itself, in addition to the natural
  // tab-order focus travel between each card's links/buttons — per
  // docs/InformationArchitecture.md § 10.1 keyboard navigation baseline.
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
      aria-labelledby="featured-artists-title"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <Container width="wide">
        <header className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-primary mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
              Featured Artists
            </p>
            <h2
              id="featured-artists-title"
              className="font-display text-foreground text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
            >
              Meet the talent worth booking twice.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
              A hand-picked lineup of verified performers across genres and cities — real
              reviews, transparent pricing, and fast responses, so you can book with
              confidence before you&rsquo;ve even made contact.
            </p>
          </div>

          <Button asChild variant="outline" className="hidden shrink-0 sm:inline-flex">
            <Link href={VIEW_ALL_HREF}>
              View All Artists
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </header>

        <div className="relative">
          <div
            ref={scrollerRef}
            aria-label="Featured artists"
            tabIndex={0}
            onKeyDown={handleTrackKeyDown}
            className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto scroll-smooth px-5 pb-4 focus-visible:outline-none md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {featuredArtists.map((artist, index) => (
              <FeaturedArtistCard
                key={artist.name}
                artist={artist}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>

          {/* Prev/next controls — desktop/pointer-only affordance per
              docs/LandingPageExperience.md § Hover Behaviour ("touch devices
              don't need them"). Kept subtly visible at rest rather than
              hover-only-hidden, so a keyboard user who tabs to them can
              actually see what they're about to activate — the same
              "never hide a real control behind :hover alone" precedent the
              Traditional card's play affordance already set. */}
          <div className="pointer-events-none absolute -inset-x-5 inset-y-0 hidden items-center justify-between lg:flex">
            <button
              type="button"
              aria-label="Scroll to previous artists"
              onClick={() => scrollByDirection(-1)}
              className="border-border/60 bg-background/90 text-foreground pointer-events-auto flex size-10 -translate-x-1/2 items-center justify-center rounded-full border opacity-70 shadow-md backdrop-blur-md transition-opacity hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Scroll to next artists"
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
              View All Artists
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
