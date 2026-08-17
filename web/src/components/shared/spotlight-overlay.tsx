"use client";

import type { PointerEvent } from "react";

import { cn } from "@/lib/utils";

/**
 * Cursor-following "spotlight" hover effect — extracted here so it has
 * exactly one implementation shared across every premium card in the
 * product, instead of being re-typed per feature (this milestone's brief:
 * "Reuse wherever possible... Spotlight effect. Do NOT duplicate existing
 * logic."). `featured-artists/featured-artist-card.tsx` (a completed,
 * frozen section) still has its own inline copy of this same logic — it
 * predates this extraction and is intentionally left untouched per this
 * milestone's "never modify a completed section" rule, but any *new* card
 * should consume this instead.
 *
 * Deliberately built on direct DOM `style.setProperty` calls, not React
 * state — pointer movement never triggers a re-render, satisfying the
 * "no unnecessary rerenders" / GPU-only-transforms performance rule.
 */
export function useSpotlight(enabled: boolean) {
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!enabled || event.pointerType === "touch") return;

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

  return { onPointerMove };
}

interface SpotlightOverlayProps {
  /** Diameter of the highlight circle, in px. */
  radius?: number;
  /**
   * Controls *when* the overlay becomes visible — e.g.
   * `"group-hover/media:opacity-100 group-focus-visible/media:opacity-100"`.
   * Left to the caller because the right trigger (which named `group`,
   * hover vs. focus-visible) differs per card layout.
   */
  visibleClassName: string;
  className?: string;
}

/**
 * The visual half of the effect — a radial highlight built from the theme's
 * own `--primary` token via `color-mix` (same technique already used in
 * `components/ui/button.tsx`'s hover state), never the brand's reserved gold
 * Spotlight Glow gradient. That literal gold motif is deliberately capped at
 * three page-wide appearances per docs/LandingPageExperience.md § 4 (Hero,
 * Traditional Spotlight, For Performers CTA) — reusing it on every card in
 * every scrollable row on the page would dilute it into decoration, which
 * that doc explicitly warns against.
 */
export function SpotlightOverlay({
  radius = 220,
  visibleClassName,
  className,
}: SpotlightOverlayProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
        visibleClassName,
        className,
      )}
      style={{
        background: `radial-gradient(${radius}px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklch, var(--primary) 40%, transparent), transparent 70%)`,
      }}
    />
  );
}
