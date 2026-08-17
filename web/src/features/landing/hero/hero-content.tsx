import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";

import { fadeUp, fadeUpSmall } from "@/lib/motion";

const EYEBROW = "Discover · Perform · Connect";
const HEADLINE = "Every unforgettable event starts with the right sound.";
const SUBHEADLINE =
  "Find and book verified musicians, bands, and traditional performers near you — with real videos, transparent pricing, and honest reviews.";

interface HeroContentProps {
  reduceMotion: boolean;
  eyebrowDelay: number;
  headlineDelay: number;
  subheadlineDelay: number;
}

/**
 * Headline + eyebrow + subheadline + the quiet "I'm a performer" link — the
 * text half of the Hero. Entrance timing/copy verbatim from
 * docs/LandingPageExperience.md § Hero > Headline, Subheadline, Buttons.
 *
 * Colors are fixed white/near-white rather than theme tokens (`text-
 * foreground`), matching hero-background.tsx's "always-dark cinematic
 * surface" decision — this text sits on a photograph, not on `--background`.
 */
export function HeroContent({
  reduceMotion,
  eyebrowDelay,
  headlineDelay,
  subheadlineDelay,
}: HeroContentProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <motion.p
        variants={fadeUpSmall}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={{ delay: reduceMotion ? 0 : eyebrowDelay }}
        className="text-gold-500/80 text-xs font-semibold tracking-[0.08em] uppercase sm:text-sm"
      >
        {EYEBROW}
      </motion.p>

      <motion.h1
        variants={fadeUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={{ delay: reduceMotion ? 0 : headlineDelay }}
        className="font-display text-[2.25rem] leading-[1.08] font-bold tracking-[-0.02em] text-balance text-white sm:text-[2.75rem] lg:text-[3.5rem]"
      >
        {HEADLINE}
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        transition={{ delay: reduceMotion ? 0 : subheadlineDelay }}
        className="max-w-[34rem] text-base text-balance text-white/70 sm:text-lg"
      >
        {SUBHEADLINE}
      </motion.p>
    </div>
  );
}

interface HeroPerformerLinkProps {
  reduceMotion: boolean;
  delay: number;
}

/**
 * Deliberately separate from `HeroContent` — it sits below the search bar,
 * not the text block, per the Hero's layout order (see hero-section.tsx).
 */
export function HeroPerformerLink({ reduceMotion, delay }: HeroPerformerLinkProps) {
  return (
    <motion.div
      variants={fadeUpSmall}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={{ delay: reduceMotion ? 0 : delay }}
    >
      <Link
        href={"/for-performers" as Route}
        className="group text-sm text-white/60 transition-colors hover:text-white"
      >
        I&rsquo;m a performer
        <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
        <span className="mt-0.5 block h-px max-w-0 bg-white/60 transition-[max-width] duration-300 group-hover:max-w-full" />
      </Link>
    </motion.div>
  );
}
