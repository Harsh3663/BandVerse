"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around `next-themes`, kept as its own file (rather than used
 * directly in layout.tsx) so the provider config is co-located, documented,
 * and swappable in one place.
 *
 * - `attribute="class"` toggles the `.dark` class on <html>, matching the
 *   `@custom-variant dark (&:is(.dark *))` selector in globals.css.
 * - `defaultTheme="dark"` — the Design System is explicitly dark-first: the
 *   brand's "stage" metaphor and elevation model are designed around dark
 *   surfaces first, with light theme fully supported, not a fallback.
 * - `enableSystem` still lets users who prefer their OS setting get it;
 *   `defaultTheme` only applies before a preference is known.
 * - `disableTransitionOnChange` prevents a flash of transitioning colors
 *   across the whole page the instant the theme class is toggled.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
