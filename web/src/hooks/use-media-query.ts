"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook built on `useSyncExternalStore`, which is the
 * React-recommended way to subscribe to external browser state (avoids the
 * classic useEffect + useState hydration-mismatch flicker on first render).
 *
 * Usage: `const isDesktop = useMediaQuery("(min-width: 64rem)")`
 * Prefer matching the exact breakpoint values defined in globals.css
 * (`--breakpoint-*`) so JS-driven responsive logic never drifts from CSS.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false, // server snapshot: assume non-matching until hydrated
  );
}
