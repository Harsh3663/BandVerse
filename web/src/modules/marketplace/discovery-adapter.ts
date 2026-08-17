import type { StaticImageData } from "next/image";
import type { DiscoveryPerformer, PerformerKind } from "@/data/discovery-types";

import { getTrustBadgeDefinition } from "./config/trust";
import type { MediaSource, PerformerProfile } from "./types";

function routeKindFor(profile: PerformerProfile): PerformerKind {
  if (profile.kind === "solo" || profile.kind === "dj") return "artist";
  if (profile.kind === "traditional-group") return "traditional";
  return "band";
}

function toDiscoveryImage(source: MediaSource): StaticImageData {
  return typeof source === "string"
    ? ({ src: source, width: 640, height: 640 } as StaticImageData)
    : source;
}

export function toDiscoveryPerformer(profile: PerformerProfile): DiscoveryPerformer {
  const kind = routeKindFor(profile);
  const startingPrice = profile.pricingPackages.reduce(
    (lowest, pricingPackage) =>
      !lowest || pricingPackage.price.amount < lowest
        ? pricingPackage.price.amount
        : lowest,
    profile.pricingPackages[0]?.price.amount ?? 0,
  );

  return {
    id: profile.id,
    kind,
    name: profile.displayName,
    category: profile.headline,
    location: profile.travel.baseLocation.city,
    description: profile.biography,
    rating: profile.rating.average,
    reviewCount: profile.rating.count,
    completedEvents: profile.experience.completedEvents,
    startingPrice,
    tags: [...new Set(profile.genreIds)],
    verified: profile.verified,
    trustBadges: profile.trustSignals.badges.map(
      (kind) => getTrustBadgeDefinition(kind).label,
    ),
    href: `/${kind === "traditional" ? "group" : kind}/${profile.handle}`,
    image: toDiscoveryImage(profile.profilePhoto.source),
    imageAlt: profile.profilePhoto.alt ?? profile.displayName,
  };
}

export function toDiscoveryPerformers(
  profiles: readonly PerformerProfile[],
): DiscoveryPerformer[] {
  return profiles.map(toDiscoveryPerformer);
}
