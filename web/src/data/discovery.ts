import { featuredArtists } from "@/features/landing/featured-artists/featured-artists-data";
import { featuredBands } from "@/features/landing/featured-bands/featured-bands-data";
import { featuredCategories } from "@/features/landing/categories/category-data";
import { traditionalPerformers } from "@/features/landing/traditional/traditional-data";
import { slugify } from "@/lib/discovery";

import type {
  DiscoveryCategory,
  DiscoveryEvent,
  DiscoveryPerformer,
  FilterOption,
} from "./discovery-types";

const artistRecords = featuredArtists.map((artist): DiscoveryPerformer => ({
  id: `artist-${slugify(artist.name)}`,
  kind: "artist",
  name: artist.name,
  category: artist.instrument,
  location: artist.city,
  rating: artist.rating,
  reviewCount: artist.reviewCount,
  startingPrice: artist.startingPrice,
  tags: artist.genres,
  verified: artist.verified,
  href: artist.href,
  image: artist.image,
  imageAlt: artist.imageAlt,
}));

const bandRecords = featuredBands.map((band): DiscoveryPerformer => ({
  id: `band-${slugify(band.name)}`,
  kind: "band",
  name: band.name,
  category: band.category,
  location: band.location,
  description: band.tagline,
  rating: band.rating,
  reviewCount: band.reviewCount,
  completedEvents: band.completedEvents,
  startingPrice: band.startingPrice,
  tags: band.availableFor,
  verified: band.verified,
  href: band.href,
  image: band.coverImage,
  imageAlt: band.coverImageAlt,
}));

const traditionalRecords = traditionalPerformers.map((performer): DiscoveryPerformer => ({
  id: `traditional-${slugify(performer.name)}`,
  kind: "traditional",
  name: performer.name,
  category: performer.category,
  location: performer.city,
  description: performer.description,
  rating: performer.rating,
  completedEvents: performer.eventsCompleted,
  startingPrice: performer.startingPrice,
  tags: [performer.category],
  verified: true,
  href: performer.href,
  image: performer.image,
  imageAlt: performer.imageAlt,
}));

export const discoveryPerformers: readonly DiscoveryPerformer[] = [
  ...artistRecords,
  ...bandRecords,
  ...traditionalRecords,
];

export const discoveryCategories: readonly DiscoveryCategory[] = featuredCategories.map(
  (category) => ({
    id: slugify(category.name),
    name: category.name,
    description: category.description,
    performerCount: category.performerCount,
    href: category.href,
    image: category.image,
    imageAlt: category.imageAlt,
  }),
);

/**
 * Event records intentionally reuse existing discovery photography. They are
 * illustrative until an events API exists; no performer/category record is
 * copied to create them.
 */
export const discoveryEvents: readonly DiscoveryEvent[] = [
  {
    id: "event-monsoon-jazz-evening",
    title: "Monsoon Jazz Evening",
    date: "2026-08-22T19:30:00+05:30",
    venue: "The Blue Room",
    city: "Kolkata",
    category: "Live music",
    priceFrom: 799,
    href: "/events/monsoon-jazz-evening",
    image: featuredBands[4].coverImage,
    imageAlt: featuredBands[4].coverImageAlt,
  },
  {
    id: "event-folk-stories-under-stars",
    title: "Folk Stories Under the Stars",
    date: "2026-09-05T18:00:00+05:30",
    venue: "Jawahar Kala Kendra",
    city: "Jaipur",
    category: "Folk",
    priceFrom: 499,
    href: "/events/folk-stories-under-the-stars",
    image: traditionalPerformers[4].image,
    imageAlt: traditionalPerformers[4].imageAlt,
  },
  {
    id: "event-festival-of-rhythm",
    title: "Festival of Rhythm",
    date: "2026-09-19T17:00:00+05:30",
    venue: "Shaniwar Wada",
    city: "Pune",
    category: "Traditional",
    href: "/events/festival-of-rhythm",
    image: traditionalPerformers[0].image,
    imageAlt: traditionalPerformers[0].imageAlt,
  },
];

function uniqueOptions(values: readonly string[]): FilterOption[] {
  return [...new Set(values)]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value: slugify(value) }));
}

export const discoveryFilterOptions = {
  categories: uniqueOptions(discoveryPerformers.map(({ category }) => category)),
  locations: uniqueOptions(discoveryPerformers.map(({ location }) => location)),
  performerKinds: [
    { label: "Solo artists", value: "artist" },
    { label: "Bands", value: "band" },
    { label: "Traditional groups", value: "traditional" },
  ],
} as const;

export type {
  DiscoveryCategory,
  DiscoveryEvent,
  DiscoveryPerformer,
  FilterOption,
  PerformerKind,
} from "./discovery-types";
