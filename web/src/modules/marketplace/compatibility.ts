import { resolveMarketplaceCity } from "./config/discovery";
import { eventTypeRegistry } from "./config/event-types";
import { distanceInKm, isPerformerAvailableOn } from "./filters";
import type { CompatibilityBreakdown, EventContext, PerformerProfile } from "./types";

const normalize = (value: string) => value.trim().toLocaleLowerCase("en-IN");

function overlapScore(
  profileValues: readonly string[],
  requested?: readonly string[],
): number {
  if (!requested?.length) return 72;
  const normalized = new Set(profileValues.map(normalize));
  const matches = requested.filter((value) => normalized.has(normalize(value))).length;
  if (!matches) return 12;
  return Math.round((matches / requested.length) * 100);
}

function scoreBudget(profile: PerformerProfile, budget: number): number {
  const prices = profile.pricingPackages.map(
    (pricingPackage) => pricingPackage.price.amount,
  );
  if (!prices.length) return 50;
  const minimumPrice = Math.min(...prices);
  if (budget >= minimumPrice * 1.4) return 100;
  if (budget >= minimumPrice) return 88;
  if (budget >= minimumPrice * 0.85) return 68;
  if (budget >= minimumPrice * 0.65) return 42;
  return 18;
}

function scoreDistance(profile: PerformerProfile, city: string): number {
  const eventCity = resolveMarketplaceCity(city);
  const performerCity = resolveMarketplaceCity(profile.travel.baseLocation.city);

  if (
    normalize(profile.travel.baseLocation.city) === normalize(city) ||
    (eventCity && performerCity && eventCity.id === performerCity.id)
  ) {
    return 100;
  }

  const performerCoordinates = profile.travel.baseLocation.coordinates;
  if (!eventCity?.coordinates || !performerCoordinates) {
    return profile.travel.nationwide ? 72 : 48;
  }

  const distanceKm = distanceInKm(eventCity.coordinates, performerCoordinates);
  if (distanceKm <= profile.travel.radiusKm) {
    return Math.max(70, Math.round(100 - distanceKm / 4));
  }
  if (profile.travel.nationwide && distanceKm <= 500) {
    return Math.max(45, Math.round(82 - distanceKm / 8));
  }
  return Math.max(8, Math.round(40 - distanceKm / 25));
}

function scoreAvailability(profile: PerformerProfile, eventDate?: string): number {
  if (eventDate) {
    return isPerformerAvailableOn(profile, eventDate) ? 95 : 22;
  }
  const openWeekdays = profile.availability.weekly.filter(
    (slot) => slot.ranges.length > 0,
  );
  if (!openWeekdays.length) return 30;
  return Math.min(88, 55 + openWeekdays.length * 5);
}

function scoreExperience(
  profile: PerformerProfile,
  guests: number,
  eventTypeId: string,
): number {
  const eventType = eventTypeRegistry[eventTypeId as keyof typeof eventTypeRegistry];
  let score = Math.min(95, 40 + profile.experience.years * 4);

  if (profile.rating.average >= 4.8) score += 8;
  else if (profile.rating.average >= 4.5) score += 4;

  const completedEvents = profile.experience.completedEvents ?? 0;
  if (completedEvents >= 100) score += 6;
  else if (completedEvents >= 30) score += 3;

  if (guests >= 500 && (profile.memberCount ?? 1) >= 4) score += 5;
  if (guests <= 120 && profile.kind === "solo") score += 4;

  if (eventType) {
    const supportsEvent = profile.supportedEventTypeIds.some(
      (id) => normalize(id) === normalize(eventTypeId),
    );
    if (supportsEvent) score += 8;
    const categoryOverlap = profile.categoryIds.some((categoryId) =>
      eventType.performerCategoryIds.includes(categoryId),
    );
    if (categoryOverlap) score += 5;
  }

  return Math.min(100, score);
}

function scoreGenre(
  profile: PerformerProfile,
  genreIds: readonly string[] | undefined,
  eventTypeId: string,
): number {
  const eventType = eventTypeRegistry[eventTypeId as keyof typeof eventTypeRegistry];
  const requested = genreIds?.length
    ? genreIds
    : (eventType?.suggestedGenreIds ?? profile.genreIds);
  return overlapScore(profile.genreIds, requested);
}

function scoreLanguage(
  profile: PerformerProfile,
  languageIds?: readonly string[],
): number {
  return overlapScore(profile.languageIds, languageIds);
}

function roundScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeCompatibility(
  profile: PerformerProfile,
  context: EventContext,
): CompatibilityBreakdown {
  const availabilityScore = roundScore(scoreAvailability(profile, context.eventDate));
  const budgetMatch = roundScore(scoreBudget(profile, context.budget));
  const distanceMatch = roundScore(scoreDistance(profile, context.city));
  const genreMatch = roundScore(
    scoreGenre(profile, context.genreIds, context.eventTypeId),
  );
  const languageMatch = roundScore(scoreLanguage(profile, context.languageIds));
  const experienceMatch = roundScore(
    scoreExperience(profile, context.guests, context.eventTypeId),
  );

  const overallMatch = roundScore(
    availabilityScore * 0.12 +
      budgetMatch * 0.22 +
      distanceMatch * 0.18 +
      genreMatch * 0.2 +
      languageMatch * 0.13 +
      experienceMatch * 0.15,
  );

  return {
    availabilityScore,
    budgetMatch,
    distanceMatch,
    genreMatch,
    languageMatch,
    experienceMatch,
    overallMatch,
  };
}

export function compatibilityReasons(
  profile: PerformerProfile,
  context: EventContext,
  breakdown: CompatibilityBreakdown,
): string[] {
  const reasons: string[] = [];

  if (breakdown.budgetMatch >= 80) {
    reasons.push("Fits comfortably within your stated budget.");
  } else if (breakdown.budgetMatch >= 60) {
    reasons.push("Pricing is close to your budget with room for package adjustments.");
  }

  if (breakdown.distanceMatch >= 85) {
    reasons.push(`Based in or near ${context.city}.`);
  } else if (profile.travel.nationwide) {
    reasons.push("Available for nationwide travel.");
  }

  if (breakdown.genreMatch >= 75) {
    reasons.push("Strong genre alignment with your event brief.");
  }

  if (breakdown.languageMatch >= 75 && context.languageIds?.length) {
    reasons.push("Speaks languages requested for the event.");
  }

  if (breakdown.experienceMatch >= 80) {
    reasons.push(
      `${profile.experience.years}+ years of experience with ${profile.rating.average.toFixed(1)} average rating.`,
    );
  }

  if (breakdown.availabilityScore >= 85 && context.eventDate) {
    reasons.push("Calendar indicates availability on your event date.");
  }

  if (
    profile.supportedEventTypeIds.some(
      (id) => normalize(id) === normalize(context.eventTypeId),
    )
  ) {
    reasons.push("Regularly performs at similar event types.");
  }

  return reasons.slice(0, 4);
}
