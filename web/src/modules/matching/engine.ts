import { resolveMarketplaceCity } from "@/modules/marketplace/config/discovery";
import { eventTypeRegistry } from "@/modules/marketplace/config/event-types";
import { distanceInKm, isPerformerAvailableOn } from "@/modules/marketplace/filters";
import type {
  MarketplaceEvent,
  PerformerProfile,
  VenueProfile,
} from "@/modules/marketplace/types";

import {
  buildWhyRecommended,
  clampScore,
  combineWeightedScores,
  type MatchingEventContext,
  type MatchReason,
  type PerformerMatchResult,
  type VenueMatchResult,
  type EventMatchResult,
  type PerformerMatchBundles,
} from "./types";

const normalize = (value: string) => value.trim().toLocaleLowerCase("en-IN");

function overlapPercent(
  profileValues: readonly string[],
  requested?: readonly string[],
): number {
  if (!requested?.length) return 70;
  const set = new Set(profileValues.map(normalize));
  const matches = requested.filter((v) => set.has(normalize(v))).length;
  if (!matches) return 15;
  return clampScore((matches / requested.length) * 100);
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
  const coords = profile.travel.baseLocation.coordinates;
  if (!eventCity?.coordinates || !coords) {
    return profile.travel.nationwide ? 70 : 45;
  }
  const km = distanceInKm(eventCity.coordinates, coords);
  if (km <= profile.travel.radiusKm) return clampScore(100 - km / 4);
  if (profile.travel.nationwide && km <= 500) return clampScore(80 - km / 8);
  return clampScore(35 - km / 25);
}

function scoreBudget(profile: PerformerProfile, budget: number): number {
  const prices = profile.pricingPackages.map((p) => p.price.amount);
  if (!prices.length) return 50;
  const min = Math.min(...prices);
  if (budget >= min * 1.4) return 100;
  if (budget >= min) return 88;
  if (budget >= min * 0.85) return 65;
  if (budget >= min * 0.65) return 40;
  return 15;
}

function scoreAvailability(profile: PerformerProfile, date?: string): number {
  if (date) return isPerformerAvailableOn(profile, date) ? 96 : 18;
  const open = profile.availability.weekly.filter((w) => w.ranges.length > 0);
  return open.length ? clampScore(50 + open.length * 6) : 30;
}

function scoreExperience(profile: PerformerProfile, guests: number): number {
  let score = 35 + profile.experience.years * 4;
  const completed = profile.experience.completedEvents ?? 0;
  if (completed >= 50) score += 15;
  else if (completed >= 20) score += 8;
  if (guests >= 400 && (profile.memberCount ?? 1) >= 3) score += 8;
  if (guests <= 100 && profile.kind === "solo") score += 6;
  return clampScore(score);
}

function scoreReviews(profile: PerformerProfile): number {
  const avg = profile.rating.average;
  const count = profile.rating.count;
  let score = avg * 16;
  if (count >= 40) score += 12;
  else if (count >= 10) score += 6;
  return clampScore(score);
}

function scoreResponseRate(profile: PerformerProfile): number {
  const minutes = profile.responseTimeMinutes ?? 240;
  if (minutes <= 30) return 98;
  if (minutes <= 60) return 88;
  if (minutes <= 120) return 72;
  if (minutes <= 240) return 55;
  return 30;
}

function scorePastSuccess(profile: PerformerProfile): number {
  const proof = profile.socialProof;
  const completion = proof.completionRatePercent ?? 70;
  const bookingSuccess = proof.bookingSuccessPercent ?? 60;
  return clampScore(completion * 0.55 + bookingSuccess * 0.45);
}

function scoreCategory(
  profile: PerformerProfile,
  eventTypeId: string,
  genreIds?: readonly string[],
): number {
  const eventType = eventTypeRegistry[eventTypeId as keyof typeof eventTypeRegistry];
  let score = 40;
  if (profile.supportedEventTypeIds.some((id) => normalize(id) === normalize(eventTypeId))) {
    score += 35;
  }
  if (eventType) {
    const categoryHit = profile.categoryIds.some((id) =>
      eventType.performerCategoryIds.includes(id),
    );
    if (categoryHit) score += 15;
  }
  const genreScore = overlapPercent(
    profile.genreIds,
    genreIds?.length ? genreIds : eventType?.suggestedGenreIds,
  );
  return clampScore(score * 0.55 + genreScore * 0.45);
}

function scorePortfolioQuality(
  profile: PerformerProfile,
  portfolioCompleteness?: number,
): number {
  const mediaCount =
    profile.portfolioMedia.length +
    profile.videos.length +
    profile.mediaGallery.length +
    profile.audioSamples.length;
  let score = Math.min(70, mediaCount * 6);
  if (profile.verified) score += 10;
  if (typeof portfolioCompleteness === "number") {
    score = score * 0.45 + portfolioCompleteness * 100 * 0.55;
  }
  return clampScore(score);
}

function buildPerformerReasons(
  profile: PerformerProfile,
  context: MatchingEventContext,
  factors: ReturnType<typeof combineWeightedScores>,
): MatchReason[] {
  const reasons: MatchReason[] = [];
  if (factors.availability >= 90 && context.date) {
    reasons.push({
      code: "available",
      label: `Available on selected date`,
    });
  }
  if (profile.rating.average >= 4.5) {
    reasons.push({
      code: "rating",
      label: `${profile.rating.average.toFixed(1)} rating`,
    });
  }
  const completed = profile.experience.completedEvents ?? 0;
  if (completed > 0 && context.eventTypeId.includes("wedding")) {
    reasons.push({
      code: "weddings",
      label: `Performed ${completed} events including wedding-ready sets`,
    });
  } else if (completed >= 20) {
    reasons.push({
      code: "experience",
      label: `Performed ${completed} events`,
    });
  }
  if (factors.budgetFit >= 80) {
    reasons.push({ code: "budget", label: "Budget compatible" });
  }
  if (factors.distance >= 95) {
    reasons.push({ code: "city", label: "Located in same city" });
  } else if (factors.distance >= 70) {
    reasons.push({ code: "travel", label: "Within travel radius" });
  }
  if (factors.responseRate >= 85) {
    reasons.push({ code: "response", label: "Fast response time" });
  }
  if (factors.pastSuccess >= 80) {
    reasons.push({ code: "success", label: "Strong booking completion history" });
  }
  if (!reasons.length) {
    reasons.push({
      code: "overall",
      label: `Overall match ${factors.total}`,
    });
  }
  return reasons.slice(0, 6);
}

export interface TalentMatchingEngineOptions {
  /** 0–1 completeness from portfolio service (optional read). */
  getPortfolioCompleteness?: (performerId: string) => number | undefined;
}

export class TalentMatchingEngine {
  constructor(private readonly options: TalentMatchingEngineOptions = {}) {}

  scorePerformer(
    profile: PerformerProfile,
    context: MatchingEventContext,
  ): PerformerMatchResult {
    const guests = context.audienceSize ?? 150;
    const completeness = this.options.getPortfolioCompleteness?.(profile.id);
    const factors = combineWeightedScores({
      experience: scoreExperience(profile, guests),
      portfolioQuality: scorePortfolioQuality(profile, completeness),
      reviews: scoreReviews(profile),
      responseRate: scoreResponseRate(profile),
      distance: scoreDistance(profile, context.city),
      budgetFit: scoreBudget(profile, context.budget),
      categoryMatch: scoreCategory(profile, context.eventTypeId, context.genreIds),
      languageMatch: overlapPercent(profile.languageIds, context.languageIds),
      availability: scoreAvailability(profile, context.date),
      pastSuccess: scorePastSuccess(profile),
    });
    const reasons = buildPerformerReasons(profile, context, factors);
    const startingPrice = profile.pricingPackages.length
      ? Math.min(...profile.pricingPackages.map((p) => p.price.amount))
      : undefined;

    return {
      performerId: profile.id,
      displayName: profile.displayName,
      kind: profile.kind,
      handle: profile.handle,
      matchScore: factors.total,
      breakdown: factors,
      reasons,
      whyRecommended: buildWhyRecommended(factors.total, reasons),
      city: profile.travel.baseLocation.city,
      ratingAverage: profile.rating.average,
      startingPrice,
    };
  }

  matchPerformers(
    performers: readonly PerformerProfile[],
    context: MatchingEventContext,
  ): PerformerMatchBundles {
    const scored = performers
      .map((p) => this.scorePerformer(p, context))
      .sort((a, b) => b.matchScore - a.matchScore);

    const topPerformers = scored
      .filter((p) => p.kind === "solo" || p.kind === "dj")
      .slice(0, 10);
    const topBands = scored
      .filter(
        (p) =>
          p.kind === "band" ||
          p.kind === "ensemble" ||
          p.kind === "traditional-group",
      )
      .slice(0, 5);
    const city = normalize(context.city);
    const topLocal = scored
      .filter((p) => normalize(p.city) === city)
      .slice(0, 10);
    const bestValue = [...scored]
      .filter((p) => typeof p.startingPrice === "number")
      .sort((a, b) => {
        const va = (a.matchScore || 1) / Math.max(a.startingPrice ?? 1, 1);
        const vb = (b.matchScore || 1) / Math.max(b.startingPrice ?? 1, 1);
        return vb - va;
      })
      .slice(0, 10);
    const premium = scored
      .filter((p) => (p.startingPrice ?? 0) >= context.budget * 0.7)
      .slice(0, 10);

    return {
      topPerformers: topPerformers.length ? topPerformers : scored.slice(0, 10),
      topBands,
      topLocal: topLocal.length ? topLocal : scored.slice(0, 5),
      bestValue: bestValue.length ? bestValue : scored.slice(0, 5),
      premium: premium.length ? premium : scored.slice(0, 5),
      context,
    };
  }

  matchVenues(
    venues: readonly VenueProfile[],
    context: MatchingEventContext,
  ): VenueMatchResult[] {
    return venues
      .map((venue) => {
        const reasons: MatchReason[] = [];
        let score = 40;

        if (normalize(venue.location.city) === normalize(context.city)) {
          score += 30;
          reasons.push({ code: "city", label: "Located in same city" });
        } else {
          score += 8;
        }

        const capacity =
          venue.capacity.standing ?? venue.capacity.seated ?? 0;
        if (context.capacityNeeded) {
          if (capacity >= context.capacityNeeded) {
            score += 20;
            reasons.push({
              code: "capacity",
              label: `Fits audience (~${capacity} capacity)`,
            });
          } else if (capacity >= context.capacityNeeded * 0.8) {
            score += 10;
          }
        } else if (capacity > 0) {
          score += 8;
        }

        if (context.requiredAmenities?.length) {
          const set = new Set(venue.amenityIds.map(normalize));
          const hits = context.requiredAmenities.filter((a) =>
            set.has(normalize(a)),
          ).length;
          const ratio = hits / context.requiredAmenities.length;
          score += Math.round(ratio * 20);
          if (ratio >= 0.5) {
            reasons.push({
              code: "amenities",
              label: `Matches ${hits}/${context.requiredAmenities.length} amenities`,
            });
          }
        } else if (venue.amenityIds.length) {
          score += 6;
        }

        if (
          venue.preferredEventTypeIds.some(
            (id) => normalize(id) === normalize(context.eventTypeId),
          )
        ) {
          score += 12;
          reasons.push({
            code: "event_type",
            label: "Preferred event type match",
          });
        }

        if (venue.verified) {
          score += 6;
          reasons.push({ code: "verified", label: "Verified venue" });
        }

        // soft budget signal: premium venues for higher budgets
        if (context.budget >= 100_000 && venue.type === "resort") score += 4;
        if (context.budget <= 40_000 && venue.type === "cafe") score += 4;

        const matchScore = clampScore(score);
        if (!reasons.length) {
          reasons.push({
            code: "overall",
            label: `Overall venue match ${matchScore}`,
          });
        }

        return {
          venueId: venue.id,
          name: venue.name,
          handle: venue.handle,
          type: venue.type,
          matchScore,
          reasons,
          whyRecommended: buildWhyRecommended(matchScore, reasons),
          city: venue.location.city,
          capacity: capacity || undefined,
        } satisfies VenueMatchResult;
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /** Suggested events a performer should apply for. */
  suggestEventsForPerformer(
    profile: PerformerProfile,
    events: readonly MarketplaceEvent[],
    limit = 10,
  ): EventMatchResult[] {
    return events
      .filter((e) => e.status === "published" || e.status === "draft")
      .map((event) => {
        const context: MatchingEventContext = {
          eventId: event.id,
          eventTypeId: event.eventTypeId,
          budget: event.budget.maximum.amount,
          city: event.location.city,
          date: event.startsAt.slice(0, 10),
          audienceSize: event.audienceSize,
          genreIds: event.preferredGenreIds,
          languageIds: event.languageIds,
          venueId: event.venueId,
        };
        const scored = this.scorePerformer(profile, context);
        const reasons = scored.reasons;
        return {
          eventId: event.id,
          title: event.title,
          eventTypeId: event.eventTypeId,
          matchScore: scored.matchScore,
          reasons,
          whyRecommended: scored.whyRecommended,
          city: event.location.city,
          startsAt: event.startsAt,
          budgetMaximum: event.budget.maximum.amount,
        } satisfies EventMatchResult;
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }
}

export function createTalentMatchingEngine(
  options?: TalentMatchingEngineOptions,
): TalentMatchingEngine {
  return new TalentMatchingEngine(options);
}
