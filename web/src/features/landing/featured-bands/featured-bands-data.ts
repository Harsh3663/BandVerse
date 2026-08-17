import type { StaticImageData } from "next/image";

import corporateImage from "@/assets/featured-bands/featured-band-corporate.jpg";
import coverBandImage from "@/assets/featured-bands/featured-band-cover.jpg";
import dholImage from "@/assets/featured-bands/featured-band-dhol.jpg";
import fusionImage from "@/assets/featured-bands/featured-band-fusion.jpg";
import indieImage from "@/assets/featured-bands/featured-band-indie.jpg";
import jazzImage from "@/assets/featured-bands/featured-band-jazz.jpg";
import rockImage from "@/assets/featured-bands/featured-band-rock.jpg";
import weddingImage from "@/assets/featured-bands/featured-band-wedding.jpg";

import type { BandCategory } from "./band-type-badge";

/** Fixed vocabulary matching this milestone's brief exactly — kept as a
 * union (not a free string) so every card's "Available for" chips render
 * from the same finite set. */
export type EventType =
  "Wedding" | "Corporate" | "Festival" | "Birthday" | "Private Events";

export interface FeaturedBand {
  name: string;
  /** Short, deterministic monogram for the on-cover avatar chip — see
   * docs/LandingPageExperience.md § Premium Details #48 ("tasteful
   * initials-based avatar... never a generic gray silhouette icon"). No
   * separate logo image asset needed; a real uploaded band logo would
   * simply replace this at the same call site later. */
  initials: string;
  category: BandCategory;
  location: string;
  /** One-line brand voice, unique per band — this is what stops eight cards
   * from reading as eight instances of the same template. */
  tagline: string;
  memberCount: number;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  languages: string[];
  availableFor: EventType[];
  experienceYears: number;
  completedEvents: number;
  responseTime: string;
  verified: boolean;
  /** Real IA path — docs/InformationArchitecture.md § Sitemap, "Band Profile
   * (/band/[handle])". Same deferred-route convention as every other
   * landing section: links to the real future path, not a placeholder "#". */
  href: string;
  coverImage: StaticImageData;
  coverImageAlt: string;
}

/**
 * IMPORTANT — PLACEHOLDER CONTENT, same convention as
 * traditional/traditional-data.ts and featured-artists/featured-artists-data.ts:
 * illustrative names, stats, and pricing standing in for real, verified band
 * profiles (none exist in the platform yet). Imagery is AI-generated, graded
 * to match the Design System's photography style. `FeaturedBandCard`
 * consumes this shape generically, so swapping in real profiles later
 * requires no changes anywhere else.
 *
 * "The Groove Collective" deliberately reuses the exact band name from
 * docs/PRD.md § 6.3's persona (Arjun Mehta's wedding band) rather than a
 * new invented name — small continuity detail between the product's own
 * source-of-truth persona and its placeholder content.
 */
export const featuredBands: FeaturedBand[] = [
  {
    name: "The Groove Collective",
    initials: "TGC",
    category: "Wedding Band",
    location: "Delhi NCR",
    tagline: "Grand entrances, unforgettable receptions.",
    memberCount: 6,
    rating: 4.9,
    reviewCount: 312,
    startingPrice: 85_000,
    languages: ["Hindi", "English", "Punjabi"],
    availableFor: ["Wedding", "Private Events", "Festival"],
    experienceYears: 9,
    completedEvents: 420,
    responseTime: "Replies within 2 hours",
    verified: true,
    href: "/band/the-groove-collective",
    coverImage: weddingImage,
    coverImageAlt:
      "The Groove Collective performing on an ornate wedding reception stage",
  },
  {
    name: "Electric Static",
    initials: "ES",
    category: "Rock Band",
    location: "Bengaluru",
    tagline: "High-voltage rock for crowds that want it loud.",
    memberCount: 4,
    rating: 4.7,
    reviewCount: 156,
    startingPrice: 45_000,
    languages: ["English", "Hindi", "Kannada"],
    availableFor: ["Corporate", "Festival", "Private Events"],
    experienceYears: 6,
    completedEvents: 180,
    responseTime: "Replies within 4 hours",
    verified: true,
    href: "/band/electric-static",
    coverImage: rockImage,
    coverImageAlt: "Electric Static performing under red and blue stage lighting",
  },
  {
    name: "Taal Vidroha Pathak",
    initials: "TVP",
    category: "Dhol Tasha",
    location: "Pune",
    tagline: "Festival-grade rhythm, twenty drums strong.",
    memberCount: 22,
    rating: 4.9,
    reviewCount: 289,
    startingPrice: 30_000,
    languages: ["Marathi", "Hindi"],
    availableFor: ["Wedding", "Festival"],
    experienceYears: 12,
    completedEvents: 340,
    responseTime: "Replies within 3 hours",
    verified: true,
    href: "/band/taal-vidroha-pathak",
    coverImage: dholImage,
    coverImageAlt:
      "Taal Vidroha Pathak's Dhol Tasha troupe performing in a festival procession",
  },
  {
    name: "Confluence",
    initials: "CF",
    category: "Fusion Band",
    location: "Mumbai",
    tagline: "Sitar meets synth — a genuinely original sound.",
    memberCount: 5,
    rating: 4.8,
    reviewCount: 134,
    startingPrice: 55_000,
    languages: ["Hindi", "English", "Marathi"],
    availableFor: ["Corporate", "Festival", "Private Events"],
    experienceYears: 8,
    completedEvents: 210,
    responseTime: "Replies within 3 hours",
    verified: true,
    href: "/band/confluence",
    coverImage: fusionImage,
    coverImageAlt: "Confluence blending sitar, tabla, and electric guitar on stage",
  },
  {
    name: "The Blue Room Quartet",
    initials: "BRQ",
    category: "Jazz Band",
    location: "Kolkata",
    tagline: "Late-night jazz for intimate evenings.",
    memberCount: 4,
    rating: 5.0,
    reviewCount: 98,
    startingPrice: 40_000,
    languages: ["Bengali", "English", "Hindi"],
    availableFor: ["Corporate", "Private Events"],
    experienceYears: 11,
    completedEvents: 165,
    responseTime: "Replies within 5 hours",
    verified: true,
    href: "/band/the-blue-room-quartet",
    coverImage: jazzImage,
    coverImageAlt: "The Blue Room Quartet performing in a dim, intimate jazz club",
  },
  {
    name: "Meridian Corporate Ensemble",
    initials: "MCE",
    category: "Corporate Band",
    location: "Hyderabad",
    tagline: "Polished, on-brand entertainment for the boardroom and beyond.",
    memberCount: 6,
    rating: 4.8,
    reviewCount: 201,
    startingPrice: 70_000,
    languages: ["English", "Hindi", "Telugu"],
    availableFor: ["Corporate", "Private Events"],
    experienceYears: 10,
    completedEvents: 275,
    responseTime: "Replies within 1 hour",
    verified: true,
    href: "/band/meridian-corporate-ensemble",
    coverImage: corporateImage,
    coverImageAlt: "Meridian Corporate Ensemble performing at an elegant corporate gala",
  },
  {
    name: "Sunset Boulevard",
    initials: "SB",
    category: "Cover Band",
    location: "Goa",
    tagline: "Beach bars, sundowners, and songs everyone knows.",
    memberCount: 4,
    rating: 4.6,
    reviewCount: 178,
    startingPrice: 35_000,
    languages: ["English", "Hindi", "Konkani"],
    availableFor: ["Wedding", "Birthday", "Private Events"],
    experienceYears: 5,
    completedEvents: 230,
    responseTime: "Replies within 6 hours",
    verified: true,
    href: "/band/sunset-boulevard",
    coverImage: coverBandImage,
    coverImageAlt:
      "Sunset Boulevard performing on an open-air beach stage at golden hour",
  },
  {
    name: "Anthem Rising",
    initials: "AR",
    category: "Indie Band",
    location: "Chennai",
    tagline: "Original songs, raw energy, a growing cult following.",
    memberCount: 4,
    rating: 4.7,
    reviewCount: 87,
    startingPrice: 28_000,
    languages: ["Tamil", "English", "Hindi"],
    availableFor: ["Festival", "Private Events", "Birthday"],
    experienceYears: 4,
    completedEvents: 95,
    responseTime: "Replies within 4 hours",
    // Deliberately the one unverified card in this set — per
    // docs/InformationArchitecture.md § 3.2, new performers go live
    // immediately with an "Unverified" state rather than waiting on
    // manual review, so the UI must be able to render that state
    // truthfully rather than only ever showing verified profiles.
    verified: false,
    href: "/band/anthem-rising",
    coverImage: indieImage,
    coverImageAlt:
      "Anthem Rising performing at an intimate indie venue under purple light",
  },
];
