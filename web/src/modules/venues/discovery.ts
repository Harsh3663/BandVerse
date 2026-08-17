import type { NearbyOpportunity } from "./types";

export interface OpportunityCandidate {
  readonly id: string;
  readonly kind: "event" | "recurring_gig";
  readonly title: string;
  readonly city: string;
  readonly date?: string;
  readonly relevance: number;
  readonly reviewScore: number;
  readonly responseRate: number;
  readonly completionRate: number;
  readonly venueId?: string;
  readonly eventId?: string;
  readonly gigId?: string;
}

/**
 * Rank nearby opportunities by city match + relevance/reviews/response/completion.
 */
export function rankNearbyOpportunities(
  city: string,
  candidates: readonly OpportunityCandidate[],
  limit = 20,
): NearbyOpportunity[] {
  const needle = city.trim().toLocaleLowerCase("en-IN");
  return candidates
    .map((candidate) => {
      const cityMatch =
        candidate.city.toLocaleLowerCase("en-IN") === needle
          ? 1
          : candidate.city.toLocaleLowerCase("en-IN").includes(needle)
            ? 0.6
            : 0.15;
      const score =
        Math.round(
          (cityMatch * 40 +
            candidate.relevance * 25 +
            candidate.reviewScore * 15 +
            candidate.responseRate * 10 +
            candidate.completionRate * 10) *
            100,
        ) / 100;
      const reasons: string[] = [];
      if (cityMatch >= 1) reasons.push("Same city");
      else if (cityMatch >= 0.6) reasons.push("Nearby city match");
      if (candidate.relevance >= 0.7) reasons.push("High relevance");
      if (candidate.responseRate >= 0.8) reasons.push("Strong response rate");
      if (candidate.completionRate >= 0.8) reasons.push("High completion rate");
      return {
        id: candidate.id,
        kind: candidate.kind,
        title: candidate.title,
        city: candidate.city,
        date: candidate.date,
        score,
        reasons,
        venueId: candidate.venueId,
        eventId: candidate.eventId,
        gigId: candidate.gigId,
      } satisfies NearbyOpportunity;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function filterEventsByDiscovery<
  T extends {
    location: { city: string };
    eventTypeId: string;
    startsAt: string;
    budget: { maximum: { amount: number }; minimum?: { amount: number } };
  },
>(
  events: readonly T[],
  filters: {
    city?: string;
    budgetMin?: number;
    budgetMax?: number;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  },
): T[] {
  return events.filter((event) => {
    if (
      filters.city &&
      event.location.city.toLocaleLowerCase("en-IN") !==
        filters.city.toLocaleLowerCase("en-IN")
    ) {
      return false;
    }
    if (filters.category && event.eventTypeId !== filters.category) return false;
    const date = event.startsAt.slice(0, 10);
    if (filters.dateFrom && date < filters.dateFrom) return false;
    if (filters.dateTo && date > filters.dateTo) return false;
    if (
      typeof filters.budgetMax === "number" &&
      event.budget.minimum !== undefined &&
      event.budget.minimum.amount > filters.budgetMax
    ) {
      return false;
    }
    if (
      typeof filters.budgetMin === "number" &&
      event.budget.maximum.amount < filters.budgetMin
    ) {
      return false;
    }
    return true;
  });
}
