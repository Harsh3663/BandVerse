/**
 * Motion tokens — see docs/DesignSystem.md § Motion.
 *
 * CSS custom properties (e.g. `--ease-premium` in globals.css) can't be read
 * by Framer Motion's `transition` props, which need plain numbers/arrays.
 * This file is the single source of truth for those values in JS/TS so the
 * design system's timing scale stays consistent whether an animation is
 * driven by CSS or by Framer Motion — never hand-roll a duration inline.
 */

/** Durations in seconds (Framer Motion's native unit). */
export const duration = {
  instant: 0.1,
  fast: 0.18,
  base: 0.24,
  moderate: 0.32,
  slow: 0.48,
  /**
   * Reserved for full-bleed cinematic background crossfades (Hero, future
   * video montages) — deliberately slower than `slow` since this is
   * atmospheric background motion, not interface feedback, and a hurried
   * cross-dissolve would read as a glitch rather than a scene change.
   */
  cinematic: 1.6,
} as const;

/**
 * Custom decelerating cubic-bezier — fast start, gentle settle. Deliberately
 * not a default ease/linear curve; see docs/DesignSystem.md for the
 * rationale ("one of the more noticeable, if subconscious, contributors to
 * a product feeling premium versus generic").
 */
export const easePremium = [0.2, 0, 0, 1] as const;

/** Standard fade + upward-reveal, used for section/card entrances. */
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easePremium },
  },
} as const;

/** Fade + upward-reveal with a smaller translate, for secondary/supporting
 * text that shouldn't feel as weighty as `fadeUp` (e.g. an eyebrow label
 * arriving before the headline it introduces). */
export const fadeUpSmall = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easePremium },
  },
} as const;

/** Simple opacity-only fade, used where `prefers-reduced-motion` applies. */
export const fadeOnly = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.fast, ease: easePremium },
  },
} as const;

/** Card hover lift — pairs with the elevation-level increase in CSS. */
export const cardHover = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: duration.base, ease: easePremium },
  },
} as const;
