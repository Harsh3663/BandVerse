/**
 * Performer category taxonomy — mirrors docs/InformationArchitecture.md §
 * Sitemap category landing pages and the Hero search's category dropdown
 * (docs/LandingPageExperience.md § Hero > Search). Centralized here so the
 * Hero, the future Search Experience filters, and category landing pages
 * never define this list more than once.
 */
export interface PerformerCategory {
  slug: string;
  label: string;
}

export const performerCategories: PerformerCategory[] = [
  { slug: "solo-artists", label: "Solo Artists" },
  { slug: "bands", label: "Bands" },
  { slug: "dhol-tasha", label: "Dhol Tasha Groups" },
  { slug: "banjo", label: "Banjo Groups" },
  { slug: "folk", label: "Folk Artists" },
  { slug: "wedding-bands", label: "Wedding Bands" },
];
