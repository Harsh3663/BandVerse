import { Blend, Briefcase, PartyPopper, Radio, Repeat, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
// Cross-feature reuse, not duplication: Dhol Tasha already has an accurate
// custom-drawn glyph in Featured Categories, and Jazz reuses the saxophone
// glyph drawn for Featured Artists — redrawing either here would be exactly
// the "duplicate existing logic" this milestone's brief says not to do.
import { CategoryGlyph } from "@/features/landing/categories/category-glyph";
import { InstrumentGlyph } from "@/features/landing/featured-artists/instrument-glyph";
import { cn } from "@/lib/utils";

export type BandCategory =
  | "Wedding Band"
  | "Rock Band"
  | "Dhol Tasha"
  | "Fusion Band"
  | "Jazz Band"
  | "Corporate Band"
  | "Cover Band"
  | "Indie Band";

interface BandTypeBadgeProps {
  category: BandCategory;
  className?: string;
}

/** Icons for the six categories lucide-react already represents accurately.
 * Dhol Tasha and Jazz Band are handled separately below (see import
 * comment) rather than forced into a generic lucide icon that wouldn't be
 * accurate for either. */
const categoryIcons: Partial<Record<BandCategory, typeof Zap>> = {
  "Wedding Band": PartyPopper,
  "Rock Band": Zap,
  "Fusion Band": Blend,
  "Corporate Band": Briefcase,
  "Cover Band": Repeat,
  "Indie Band": Radio,
};

/**
 * The band-equivalent of a category chip — reuses the shared `Badge`
 * primitive (never a bespoke pill), just adds a small leading glyph so the
 * category reads at a glance across a scanning-heavy carousel, consistent
 * with how `TraditionalPerformerCard` already badges its category on-image.
 */
export function BandTypeBadge({ category, className }: BandTypeBadgeProps) {
  const LucideIcon = categoryIcons[category];

  return (
    <Badge variant="secondary" className={cn("font-medium", className)}>
      {category === "Dhol Tasha" ? (
        <CategoryGlyph name="dhol" />
      ) : category === "Jazz Band" ? (
        <InstrumentGlyph name="saxophonist" />
      ) : LucideIcon ? (
        <LucideIcon strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      {category}
    </Badge>
  );
}
