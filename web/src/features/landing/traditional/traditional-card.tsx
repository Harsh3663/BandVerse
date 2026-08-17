"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cardHover, duration, easePremium } from "@/lib/motion";

import { StarRating } from "./star-rating";
import type { TraditionalPerformer } from "./traditional-data";

interface TraditionalPerformerCardProps {
  performer: TraditionalPerformer;
  index: number;
  reduceMotion: boolean;
}

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Reuses the same entrance/hover motion tokens as `CategoryCard` and
 * `TrustSection` (`duration`, `easePremium`, `cardHover` from
 * src/lib/motion.ts) rather than redefining the timing — the only thing
 * genuinely specific to this card is its content layout and the "Watch
 * Performance" glass affordance, which no other existing card has.
 *
 * The play button is always visible (not a hover-only reveal): on a card
 * that must work identically for touch, mouse, and keyboard users, hiding a
 * primary listed action behind `:hover` would make it undiscoverable on
 * touch devices. Hover/focus only add the subtle scale/opacity response the
 * brief asks for — discoverability never depends on it.
 */
export function TraditionalPerformerCard({
  performer,
  index,
  reduceMotion,
}: TraditionalPerformerCardProps) {
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
      className="group border-border/60 ring-foreground/10 bg-card focus-within:ring-ring flex flex-col overflow-hidden rounded-lg border shadow-sm ring-1 focus-within:ring-2"
    >
      <Link
        href={`${performer.href}?watch=1` as Route}
        aria-label={`Watch a performance by ${performer.name}`}
        className="relative block aspect-[4/5] overflow-hidden outline-none"
      >
        <Image
          src={performer.image}
          alt={performer.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          quality={80}
          placeholder="blur"
          loading="lazy"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent" />

        <Badge
          variant="secondary"
          className="absolute top-3 left-3 border border-white/20 bg-white/15 text-white backdrop-blur-md"
        >
          {performer.category}
        </Badge>

        {/* Glass "Watch Performance" affordance — always visible (see doc
            comment above), just a subtle scale/opacity lift on hover/focus. */}
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="flex size-14 scale-95 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white opacity-90 backdrop-blur-md transition-all duration-300 group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:bg-white/25 group-hover:opacity-100">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-foreground text-lg font-semibold tracking-tight">
            {performer.name}
          </h3>
          <p className="text-muted-foreground mt-0.5 text-sm">{performer.city}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5">
            <StarRating rating={performer.rating} />
            <span className="text-foreground font-medium">
              {performer.rating.toFixed(1)}
            </span>
          </span>
          <span className="text-border" aria-hidden="true">
            •
          </span>
          <span className="text-muted-foreground">
            {performer.eventsCompleted}+ events
          </span>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {performer.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Starting at </span>
            <span className="text-foreground font-semibold">
              {priceFormatter.format(performer.startingPrice)}
            </span>
          </p>

          <Button asChild size="sm">
            <Link href={performer.href as Route}>
              View Profile
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
