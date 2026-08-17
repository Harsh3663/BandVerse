import type { ReactNode, SVGProps } from "react";

export type CategoryGlyphName = "solo" | "band" | "dhol" | "wedding" | "dj" | "folk";

interface CategoryGlyphProps extends SVGProps<SVGSVGElement> {
  name: CategoryGlyphName;
}

const glyphPaths: Record<CategoryGlyphName, ReactNode> = {
  solo: (
    <>
      <rect x="8" y="3" width="8" height="12" rx="4" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </>
  ),
  band: (
    <>
      <path d="M5 17V7l10-2v10" />
      <circle cx="3.5" cy="17.5" r="2.5" />
      <circle cx="13.5" cy="15.5" r="2.5" />
      <path d="M18 8h3M19.5 6.5v3" />
    </>
  ),
  dhol: (
    <>
      <path d="M5 7c3-2 11-2 14 0v10c-3 2-11 2-14 0V7Z" />
      <path d="m5 8 14 8M19 8 5 16M3 4l5 5M21 4l-5 5" />
    </>
  ),
  wedding: (
    <>
      <path d="M4 14h5l8 5V5L9 10H4v4Z" />
      <path d="M7 14v5M18.5 8.5h2M18.5 12h3" />
    </>
  ),
  dj: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="12" r="3" />
      <path d="M8 9v3l2 1M14 9h4M14 12h4M14 15h2" />
    </>
  ),
  folk: (
    <>
      <path d="M10 4c2 1 4 3 4 6 0 2-1 3-2 4l-4 6" />
      <path d="M14 10c3 0 5 2 5 5s-2 5-5 5-5-2-5-5c0-1 .3-2 .8-2.8" />
      <path d="m11 7 5-3M14 3l3 2" />
    </>
  ),
};

export function CategoryGlyph({ name, ...props }: CategoryGlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {glyphPaths[name]}
    </svg>
  );
}
