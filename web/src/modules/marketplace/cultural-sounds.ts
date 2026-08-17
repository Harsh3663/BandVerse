import { mockPerformerProfiles } from "./mock-data";
import type { CulturalSoundCategory, PerformerProfile } from "./types";

const normalize = (value: string) => value.trim().toLocaleLowerCase("en-IN");

function matchesCriteria(
  profile: PerformerProfile,
  category: CulturalSoundCategory,
): boolean {
  const criteria = category.matchCriteria;
  if (!criteria) return false;

  if (criteria.kind && profile.kind !== criteria.kind) return false;

  if (
    criteria.categoryIds?.length &&
    !criteria.categoryIds.some((id) => profile.categoryIds.includes(id))
  ) {
    return false;
  }

  if (
    criteria.instrumentIds?.length &&
    !criteria.instrumentIds.some((id) => profile.instrumentIds.includes(id))
  ) {
    return false;
  }

  if (
    criteria.genreIds?.length &&
    !criteria.genreIds.some((id) => profile.genreIds.includes(id))
  ) {
    return false;
  }

  if (
    criteria.languageIds?.length &&
    !criteria.languageIds.some((id) => profile.languageIds.includes(id))
  ) {
    return false;
  }

  if (
    criteria.eventTypeIds?.length &&
    !criteria.eventTypeIds.some((id) => profile.supportedEventTypeIds.includes(id))
  ) {
    return false;
  }

  if (
    criteria.states?.length &&
    !criteria.states.some(
      (state) => normalize(profile.travel.baseLocation.state) === normalize(state),
    )
  ) {
    return false;
  }

  return true;
}

export function resolveFeaturedArtists(
  category: CulturalSoundCategory,
  limit = 6,
): PerformerProfile[] {
  const byId = new Map(mockPerformerProfiles.map((profile) => [profile.id, profile]));
  const featured = category.featuredArtistIds
    .map((id) => byId.get(id))
    .filter((profile): profile is PerformerProfile => Boolean(profile));

  if (featured.length >= limit) return featured.slice(0, limit);

  const seen = new Set(featured.map((profile) => profile.id));
  const matched = mockPerformerProfiles.filter(
    (profile) => !seen.has(profile.id) && matchesCriteria(profile, category),
  );

  return [...featured, ...matched].slice(0, limit);
}

export function resolveCategoryGallery(category: CulturalSoundCategory) {
  const artists = resolveFeaturedArtists(category, 4);
  return artists.flatMap((profile) =>
    profile.mediaGallery
      .filter((asset) => asset.kind === "image")
      .slice(0, 1)
      .map((asset) => ({
        id: `${profile.id}-${asset.id}`,
        source: asset.source,
        alt: asset.alt ?? `${category.label} — ${profile.displayName}`,
        title: asset.title,
        performerName: profile.displayName,
      })),
  );
}
