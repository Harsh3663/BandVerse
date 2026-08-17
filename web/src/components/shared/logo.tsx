import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Wordmark placeholder. The Design System's Brand Identity work (a real
 * mark/lockup) hasn't been produced as a graphic asset yet — this renders
 * the name in `font-display` (see src/lib/fonts.ts) so it's already
 * type-correct and trivially swappable for an <Image>/SVG mark later
 * without touching any call site (Header, Footer both import this).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-display text-foreground text-xl font-semibold tracking-tight transition-opacity hover:opacity-80",
        className,
      )}
    >
      BandVerse
    </Link>
  );
}
