import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  className?: string;
}

const STAR_COUNT = 5;

/**
 * Non-animated by design — a static rating display doesn't need Framer
 * Motion, per this milestone's "use Framer Motion only where needed" rule.
 * The two-layer (outline + clipped-fill) technique renders fractional
 * ratings (e.g. 4.9) without any JS-computed per-star logic.
 *
 * A single `role="img"` + `aria-label` announces the rating as one phrase
 * to screen readers, rather than five redundant, individually meaningless
 * star icons.
 */
export function StarRating({ rating, className }: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(STAR_COUNT, rating));
  const fillPercentage = (clampedRating / STAR_COUNT) * 100;

  return (
    <span
      role="img"
      aria-label={`Rated ${clampedRating.toFixed(1)} out of ${STAR_COUNT} stars`}
      className={cn("relative inline-flex", className)}
    >
      <span className="text-muted-foreground/30 flex gap-0.5" aria-hidden="true">
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <Star key={index} className="size-3.5" />
        ))}
      </span>
      <span
        className="text-gold-500 absolute inset-0 flex gap-0.5 overflow-hidden"
        style={{ width: `${fillPercentage}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <Star key={index} className="size-3.5 fill-current" />
        ))}
      </span>
    </span>
  );
}
