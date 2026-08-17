"use client";

import { useEffect } from "react";
import { type MotionValue, useMotionValue, useSpring } from "framer-motion";

interface HeroParallax {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

/**
 * Subtle cursor-driven parallax for the Hero background — capped to a small
 * magnitude so it reads as "alive" rather than gimmicky, and layered only on
 * the background itself (not a separate decorative element), so it never
 * competes with the background imagery's own motion per
 * docs/LandingPageExperience.md § Hero > Motion ("no additional
 * floating/bobbing decorative animation... two independent motion sources
 * would compete and feel busy rather than cinematic").
 *
 * Built on `useMotionValue`/`useSpring` rather than React state: pointer
 * movement updates these values directly on the Framer Motion render loop,
 * completely bypassing React's reconciliation, so it never re-renders the
 * Hero tree (satisfies the "no unnecessary rerenders" performance rule).
 */
export function useHeroParallax(maxOffsetPx: number, enabled: boolean): HeroParallax {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    function handlePointerMove(event: PointerEvent) {
      const { innerWidth, innerHeight } = window;
      const relativeX = (event.clientX / innerWidth) * 2 - 1; // -1..1
      const relativeY = (event.clientY / innerHeight) * 2 - 1;
      rawX.set(relativeX * maxOffsetPx);
      rawY.set(relativeY * maxOffsetPx);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [enabled, maxOffsetPx, rawX, rawY]);

  useEffect(() => {
    if (enabled) return;
    // Recenter smoothly if the input method changes mid-session (e.g. a
    // hybrid touch+mouse laptop) rather than leaving the background offset.
    rawX.set(0);
    rawY.set(0);
  }, [enabled, rawX, rawY]);

  return { x, y };
}
