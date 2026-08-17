"use client";

import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  Clock,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightOverlay, useSpotlight } from "@/components/shared/spotlight-overlay";
// Reused as-is from the already-shipped Traditional Performers section —
// rating display logic lives in exactly one place, per this milestone's
// "do not duplicate existing logic" rule.
import { StarRating } from "@/features/landing/traditional/star-rating";
import { cardHover, duration, easePremium } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { BandTypeBadge } from "./band-type-badge";
import type { FeaturedBand } from "./featured-bands-data";
import { FavoriteBandButton } from "./favorite-band-button";

interface FeaturedBandCardProps {
  band: FeaturedBand;
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

/** Varying shades of the single brand primary hue only — per
 * docs/DesignSystem.md § Color Philosophy, semantic colors (success/
 * warning/info) are "reserved strictly for system meaning, never
 * decoration," so band-to-band avatar variety has to come from the primary
 * ramp, not from borrowing meaning-bearing colors as decoration. */
const AVATAR_TONES = [
  "bg-primary-400",
  "bg-primary-500",
  "bg-primary-600",
  "bg-primary-700",
  "bg-primary-800",
] as const;

function getAvatarTone(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

/**
 * The core discovery unit for this section. Cover aspect is 16:10 — the
 * Card component's own *default* per docs/DesignSystem.md § Cards ("media
 * area, top, 16:10 aspect ratio default"), deliberately reverted from the
 * 4:5 portrait override `FeaturedArtistCard`/`TraditionalPerformerCard` use:
 * that override exists specifically because "portrait-oriented performer
 * photography is more... flattering" for a *solo* performer, which doesn't
 * hold for a multi-person group shot — a wide stage/group composition is
 * the natural crop for a band, so this card correctly uses the anatomy's
 * un-overridden default rather than copying the solo-artist choice.
 */
export function FeaturedBandCard({ band, index, reduceMotion }: FeaturedBandCardProps) {
  const { onPointerMove } = useSpotlight(!reduceMotion);
  const avatarTone = getAvatarTone(band.name);

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
      className="group border-border/60 ring-foreground/10 bg-card focus-within:ring-ring relative flex w-[21rem] shrink-0 snap-start flex-col overflow-hidden rounded-lg border shadow-sm ring-1 transition-shadow duration-300 focus-within:ring-2 hover:shadow-xl sm:w-[24rem]"
    >
      <Link
        href={band.href as Route}
        aria-label={`View ${band.name}'s profile`}
        onPointerMove={onPointerMove}
        className="group/media relative block aspect-[16/10] overflow-hidden outline-none"
      >
        <Image
          src={band.coverImage}
          alt={band.coverImageAlt}
          fill
          sizes="(min-width: 1024px) 384px, (min-width: 640px) 60vw, 82vw"
          quality={80}
          placeholder="blur"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {!reduceMotion && (
          <SpotlightOverlay visibleClassName="group-hover/media:opacity-100 group-focus-visible/media:opacity-100" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/5 to-transparent" />

        <div className="absolute top-3 left-3">
          <BandTypeBadge
            category={band.category}
            className="border border-white/20 bg-white/15 text-white backdrop-blur-md"
          />
        </div>

        {/* Decorative "preview" affordance — always present at low opacity,
            not a hover-only reveal, per the Traditional card's established
            precedent ("hiding a primary listed action behind :hover would
            make it undiscoverable on touch devices"). Since the whole image
            is already this Link, this glass circle is purely a visual echo
            of that fact, not a second interactive target. */}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/media:opacity-100 group-focus-visible/media:opacity-100"
          aria-hidden="true"
        >
          <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            View Band
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </span>
      </Link>

      <div className="absolute top-3 right-3 z-10">
        <FavoriteBandButton bandName={band.name} reduceMotion={reduceMotion} />
      </div>

      <div className="px-5">
        <span
          className={cn(
            "ring-card flex size-12 -translate-y-6 items-center justify-center rounded-full text-sm font-semibold text-white shadow-md ring-4",
            avatarTone,
          )}
        >
          {band.initials}
        </span>
      </div>

      <div className="-mt-6 flex flex-1 flex-col gap-3 px-5 pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-foreground truncate text-lg font-semibold tracking-tight">
              {band.name}
            </h3>
            {band.verified ? (
              <BadgeCheck
                className="text-primary size-4 shrink-0"
                aria-label="Verified band"
              />
            ) : (
              <span className="text-warning-700 dark:text-warning-500 shrink-0 text-[0.65rem] font-semibold tracking-wide uppercase">
                Unverified
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{band.location}</span>
            <span className="text-border" aria-hidden="true">
              •
            </span>
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{band.memberCount} members</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <StarRating rating={band.rating} />
            <span className="text-foreground font-medium">{band.rating.toFixed(1)}</span>
          </span>
          <span className="text-border" aria-hidden="true">
            •
          </span>
          <span className="text-muted-foreground">{band.reviewCount} reviews</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {band.availableFor.map((eventType) => (
            <Badge key={eventType} variant="outline" className="font-normal">
              {eventType}
            </Badge>
          ))}
        </div>

        <p className="text-muted-foreground text-xs">
          Speaks {languageListFormatter.format(band.languages)}
        </p>

        <div className="border-border/70 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t pt-3 text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            {band.responseTime}
          </span>
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Award className="size-3.5 shrink-0" aria-hidden="true" />
            {band.experienceYears}+ yrs experience
          </span>
          <span className="text-muted-foreground col-span-2 flex items-center gap-1.5">
            <Trophy className="size-3.5 shrink-0" aria-hidden="true" />
            {band.completedEvents}+ events completed
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-sm">
            <span className="text-muted-foreground">From </span>
            <span className="text-foreground font-semibold">
              {priceFormatter.format(band.startingPrice)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`${band.href}?intent=book` as Route}>Book Band</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={band.href as Route}>
              View Band
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
