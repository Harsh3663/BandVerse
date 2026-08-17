import type { ReactNode, SVGProps } from "react";
import { Disc3, Drum, Guitar, MicVocal, Piano, Wind } from "lucide-react";

export type InstrumentGlyphName =
  | "singer"
  | "guitarist"
  | "pianist"
  | "violinist"
  | "drummer"
  | "dj"
  | "flutist"
  | "saxophonist";

interface InstrumentGlyphProps extends SVGProps<SVGSVGElement> {
  name: InstrumentGlyphName;
}

/**
 * Six of the eight instruments already have an accurate lucide-react icon
 * (the project's existing icon set) — reused directly here rather than
 * redrawn, at the Design System's specified 1.5px stroke weight so they
 * match the custom pair below exactly.
 */
const lucideIcons: Partial<Record<InstrumentGlyphName, typeof Guitar>> = {
  singer: MicVocal,
  guitarist: Guitar,
  pianist: Piano,
  drummer: Drum,
  dj: Disc3,
  flutist: Wind,
};

/**
 * Custom-drawn paths only for the two instruments lucide-react has no
 * accurate icon for — per docs/DesignSystem.md § Iconography, a mismatched
 * generic icon for an instrument like a violin or saxophone is worse than
 * no icon at all. Same 24x24 viewBox / rounded-cap convention as
 * `../categories/category-glyph.tsx`, so the full eight-instrument set
 * reads as one consistent family rather than "six library icons + two
 * bespoke ones."
 */
const customPaths: Partial<Record<InstrumentGlyphName, ReactNode>> = {
  violinist: (
    <>
      <path d="M12 2.5c1.1.8 1.1 2.4 0 3.2-1.1-.8-1.1-2.4 0-3.2Z" />
      <path d="M12 5.7v2.3" />
      <path d="M9.2 9c0-1.1 1.2-1.6 2.8-1.6s2.8.5 2.8 1.6c0 1.2-1.3 1.7-1.3 3.1 0 .9.8 1.3.8 2.7 0 1.9-1 3.5-2.3 3.5s-2.3-1.6-2.3-3.5c0-1.4.8-1.8.8-2.7 0-1.4-1.3-1.9-1.3-3.1Z" />
      <path d="M8 19.5 15.5 12" />
    </>
  ),
  saxophonist: (
    <>
      <path d="M10 3h3.5l.7 3.2h-2.4" />
      <path d="M13.8 6.2c1.3 3 1.4 8-.5 11-1.2 1.9-3 2.6-4.4 2" />
      <circle cx="7.6" cy="18.7" r="2.3" />
      <path d="M11 10.3h2.2M10.6 13h2.2" />
    </>
  ),
};

export function InstrumentGlyph({ name, className, ...props }: InstrumentGlyphProps) {
  const LucideIcon = lucideIcons[name];

  if (LucideIcon) {
    return (
      <LucideIcon
        className={className}
        strokeWidth={1.5}
        aria-hidden="true"
        focusable="false"
        {...props}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {customPaths[name]}
    </svg>
  );
}
