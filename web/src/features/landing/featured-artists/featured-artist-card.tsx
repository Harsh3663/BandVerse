"use client";

import type { PointerEvent } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  Languages,
  Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Reused as-is from the already-shipped Traditional Performers section —
// rating display logic lives in exactly one place, per the brief's "never
// duplicate logic" rule, rather than being redefined here.
import { StarRating } from "@/features/landing/traditional/star-rating";
import { cardHover, duration, easePremium } from "@/lib/motion";

import type { FeaturedArtist } from "./featured-artists-data";
import { InstrumentGlyph } from "./instrument-glyph";
import { SaveButton } from "./save-button";

interface FeaturedArtistCardProps {
  artist: FeaturedArtist;
  index: number;
  reduceMotion: boolean;
}

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const languageListFormatter = new Intl.ListFormat("en", {
  style: "short",
  type: "conjunction",
});

/**
 * The core discovery unit for this section — anatomy follows
 * docs/DesignSystem.md § Band/Artist Cards exactly (media → name + verified
 * badge → category tag → rating + reviews → price → quick-save top-right of
 * media), extended with the additional trust signals (languages, response
 * time, experience, availability) this milestone's brief calls for.
 *
 * Entrance/hover motion reuses the exact tokens already established by
 * `TraditionalPerformerCard` (`duration`, `easePremium`, `cardHover` from
 * src/lib/motion.ts) rather than redefining timing — only the content
 * layout and the pointer-driven "spotlight" are genuinely new here.
 */
export function FeaturedArtistCard({
  artist,
  index,
  reduceMotion,
}: FeaturedArtistCardProps) {
  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    if (reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spot-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    event.currentTarget.style.setProperty(
      "--spot-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        delay: reduceMotion ? 0 : index * 0.08,
        duration: duration.moderate,
        ease: easePremium,
      }}
      whileHover={reduceMotion ? undefined : cardHover.hover}
      className="group border-border/60 ring-foreground/10 bg-card focus-within:ring-ring relative flex w-[19rem] shrink-0 snap-start flex-col overflow-hidden rounded-lg border shadow-sm ring-1 transition-shadow duration-300 focus-within:ring-2 hover:shadow-xl sm:w-[20.5rem]"
    >
      <Link
        href={artist.href as Route}
        aria-label={`View ${artist.name}'s profile`}
        onPointerMove={handlePointerMove}
        className="group/media relative block aspect-[4/5] overflow-hidden outline-none"
      >
        <Image
          src={artist.image}
          alt={artist.imageAlt}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 78vw"
          quality={80}
          placeholder="blur"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Spotlight hover — a cursor-following highlight built from the
            theme's own `--primary` token via `color-mix` (same pattern
            already used in components/ui/button.tsx's hover state), NOT the
            brand's reserved gold Spotlight Glow gradient. That literal gold
            motif is deliberately capped at three page-wide appearances (Hero,
            Traditional Spotlight, For Performers CTA) per
            docs/LandingPageExperience.md § 4 — reusing it on every card in a
            scrollable row would dilute it into decoration, exactly what that
            doc warns against. Scoped to its own `group/media` (not the outer
            card `group`) so it only reacts while the pointer is actually
            over the image, where the coordinates are meaningful. */}
        {!reduceMotion && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/media:opacity-100 group-focus-visible/media:opacity-100"
            style={{
              background:
                "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklch, var(--primary) 40%, transparent), transparent 70%)",
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-transparent to-transparent" />
      </Link>

      <div className="absolute top-3 right-3 z-10">
        <SaveButton artistName={artist.name} reduceMotion={reduceMotion} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-foreground truncate text-lg font-semibold tracking-tight">
              {artist.name}
            </h3>
            {artist.verified && (
              <BadgeCheck
                className="text-primary size-4 shrink-0"
                aria-label="Verified performer"
              />
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
            <InstrumentGlyph
              name={artist.instrumentGlyph}
              className="size-3.5 shrink-0"
            />
            <span className="truncate">
              {artist.instrument} · {artist.city}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {artist.genres.map((genre) => (
            <Badge key={genre} variant="outline" className="font-normal">
              {genre}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <StarRating rating={artist.rating} />
            <span className="text-foreground font-medium">
              {artist.rating.toFixed(1)}
            </span>
          </span>
          <span className="text-border" aria-hidden="true">
            •
          </span>
          <span className="text-muted-foreground">{artist.reviewCount} reviews</span>
        </div>

        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Languages className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {languageListFormatter.format(artist.languages)}
          </span>
        </p>

        <div className="border-border/70 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-3 text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {artist.responseTime}
          </span>
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Trophy className="size-3.5 shrink-0" aria-hidden="true" />
            {artist.experienceYears}+ yrs experience
          </span>
          {/* Status conveyed via icon + text together, never color alone —
              per docs/InformationArchitecture.md § 10.3. */}
          <span className="text-foreground col-span-2 flex items-center gap-1.5 font-medium">
            <CalendarCheck
              className="text-success-500 size-3.5 shrink-0"
              aria-hidden="true"
            />
            {artist.availability}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-sm">
            <span className="text-muted-foreground">From </span>
            <span className="text-foreground font-semibold">
              {priceFormatter.format(artist.startingPrice)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`${artist.href}?intent=book` as Route}>Book Now</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={artist.href as Route}>
              View Profile
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
