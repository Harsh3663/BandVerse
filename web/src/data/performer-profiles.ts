import type { StaticImageData } from "next/image";

import { discoveryPerformers, type DiscoveryPerformer } from "@/data/discovery";
import { featuredArtists } from "@/features/landing/featured-artists/featured-artists-data";
import { featuredBands } from "@/features/landing/featured-bands/featured-bands-data";
import { traditionalPerformers } from "@/features/landing/traditional/traditional-data";

export type ProfileRouteKind = "artist" | "band" | "group";

export interface PerformerProfile {
  id: string;
  routeKind: ProfileRouteKind;
  handle: string;
  name: string;
  category: string;
  location: string;
  summary: string;
  image: StaticImageData;
  imageAlt: string;
  rating: number;
  reviewCount?: number;
  startingPrice: number;
  tags: readonly string[];
  languages: readonly string[];
  verified: boolean;
  responseTime: string;
  availability: string;
  experienceYears?: number;
  completedEvents?: number;
  memberCount?: number;
  representativeReview: string;
}

const handleFromHref = (href: string) => href.split("/").at(-1)!;

function common(record: DiscoveryPerformer) {
  return {
    id: record.id,
    handle: handleFromHref(record.href),
    name: record.name,
    category: record.category,
    location: record.location,
    image: record.image,
    imageAlt: record.imageAlt,
    rating: record.rating,
    reviewCount: record.reviewCount,
    startingPrice: record.startingPrice,
    tags: record.tags,
    verified: record.verified,
    completedEvents: record.completedEvents,
  };
}

export const performerProfiles: readonly PerformerProfile[] = discoveryPerformers.map(
  (record): PerformerProfile => {
    if (record.kind === "artist") {
      const source = featuredArtists.find((item) => item.href === record.href)!;
      return {
        ...common(record),
        routeKind: "artist",
        summary: `${source.instrument} performing ${source.genres.join(", ")} across ${source.languages.join(", ")}.`,
        languages: source.languages,
        responseTime: source.responseTime,
        availability: source.availability,
        experienceYears: source.experienceYears,
        representativeReview:
          "Representative feedback: guests appreciated the thoughtful set planning and clear communication.",
      };
    }

    if (record.kind === "band") {
      const source = featuredBands.find((item) => item.href === record.href)!;
      return {
        ...common(record),
        routeKind: "band",
        summary: source.tagline,
        languages: source.languages,
        responseTime: source.responseTime,
        availability: "Availability confirmed after an event enquiry",
        experienceYears: source.experienceYears,
        memberCount: source.memberCount,
        representativeReview:
          "Representative feedback: the sample client highlighted a well-paced set and professional coordination.",
      };
    }

    const source = traditionalPerformers.find((item) => item.href === record.href)!;
    return {
      ...common(record),
      routeKind: "group",
      summary: source.description,
      languages: [],
      responseTime: "Response time confirmed after enquiry",
      availability: "Availability confirmed after an event enquiry",
      representativeReview:
        "Representative feedback: the sample audience valued the ensemble’s energy and cultural context.",
    };
  },
);

export function getPerformerProfile(
  routeKind: ProfileRouteKind,
  handle: string,
): PerformerProfile | undefined {
  return performerProfiles.find(
    (profile) => profile.routeKind === routeKind && profile.handle === handle,
  );
}
