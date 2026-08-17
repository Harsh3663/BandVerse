/**
 * AI Talent Matching Engine — domain types & scoring.
 * Extends BandVerse without replacing marketplace recommendation modules.
 */

export interface MatchingEventContext {
  readonly eventId?: string;
  readonly eventTypeId: string;
  readonly budget: number;
  readonly city: string;
  readonly date?: string;
  readonly audienceSize?: number;
  readonly audienceType?: string;
  readonly genreIds?: readonly string[];
  readonly languageIds?: readonly string[];
  readonly venueId?: string;
  readonly requiredAmenities?: readonly string[];
  readonly capacityNeeded?: number;
}

export interface MatchFactorScores {
  readonly experience: number;
  readonly portfolioQuality: number;
  readonly reviews: number;
  readonly responseRate: number;
  readonly distance: number;
  readonly budgetFit: number;
  readonly categoryMatch: number;
  readonly languageMatch: number;
  readonly availability: number;
  readonly pastSuccess: number;
}

export interface MatchScoreBreakdown extends MatchFactorScores {
  readonly total: number;
}

export interface MatchReason {
  readonly code: string;
  readonly label: string;
}

export interface PerformerMatchResult {
  readonly performerId: string;
  readonly displayName: string;
  readonly kind: string;
  readonly handle: string;
  readonly matchScore: number;
  readonly breakdown: MatchScoreBreakdown;
  readonly reasons: readonly MatchReason[];
  readonly whyRecommended: string;
  readonly city: string;
  readonly ratingAverage: number;
  readonly startingPrice?: number;
}

export interface VenueMatchResult {
  readonly venueId: string;
  readonly name: string;
  readonly handle: string;
  readonly type: string;
  readonly matchScore: number;
  readonly reasons: readonly MatchReason[];
  readonly whyRecommended: string;
  readonly city: string;
  readonly capacity?: number;
}

export interface EventMatchResult {
  readonly eventId: string;
  readonly title: string;
  readonly eventTypeId: string;
  readonly matchScore: number;
  readonly reasons: readonly MatchReason[];
  readonly whyRecommended: string;
  readonly city: string;
  readonly startsAt: string;
  readonly budgetMaximum: number;
}

export interface PerformerMatchBundles {
  readonly topPerformers: readonly PerformerMatchResult[];
  readonly topBands: readonly PerformerMatchResult[];
  readonly topLocal: readonly PerformerMatchResult[];
  readonly bestValue: readonly PerformerMatchResult[];
  readonly premium: readonly PerformerMatchResult[];
  readonly context: MatchingEventContext;
}

export interface MatchingAnalyticsSnapshot {
  readonly impressions: number;
  readonly clicks: number;
  readonly applications: number;
  readonly bookings: number;
  readonly conversionRate: number;
  readonly clickThroughRate: number;
}

export const MATCH_WEIGHTS = {
  experience: 12,
  portfolioQuality: 10,
  reviews: 12,
  responseRate: 8,
  distance: 12,
  budgetFit: 14,
  categoryMatch: 10,
  languageMatch: 8,
  availability: 8,
  pastSuccess: 6,
} as const;

export type MatchWeightKey = keyof typeof MATCH_WEIGHTS;

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function combineWeightedScores(
  factors: MatchFactorScores,
): MatchScoreBreakdown {
  let total = 0;
  for (const key of Object.keys(MATCH_WEIGHTS) as MatchWeightKey[]) {
    total += (clampScore(factors[key]) * MATCH_WEIGHTS[key]) / 100;
  }
  return {
    ...factors,
    experience: clampScore(factors.experience),
    portfolioQuality: clampScore(factors.portfolioQuality),
    reviews: clampScore(factors.reviews),
    responseRate: clampScore(factors.responseRate),
    distance: clampScore(factors.distance),
    budgetFit: clampScore(factors.budgetFit),
    categoryMatch: clampScore(factors.categoryMatch),
    languageMatch: clampScore(factors.languageMatch),
    availability: clampScore(factors.availability),
    pastSuccess: clampScore(factors.pastSuccess),
    total: clampScore(total),
  };
}

export function buildWhyRecommended(
  score: number,
  reasons: readonly MatchReason[],
): string {
  const lines = reasons.slice(0, 5).map((r) => `- ${r.label}`);
  return `${score} Match Score\n\nReasons:\n${lines.join("\n")}`;
}
