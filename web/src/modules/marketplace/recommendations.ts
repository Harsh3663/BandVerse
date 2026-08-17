import { eventTypeRegistry } from "./config/event-types";
import { instruments, taxonomyLabel } from "./config/taxonomy";
import { compatibilityReasons, computeCompatibility } from "./compatibility";
import { filterPerformers } from "./filters";
import { mockPerformerProfiles } from "./mock-data";
import type {
  EventContext,
  PerformerProfile,
  RecommendationInput,
  RecommendationResult,
  RecommendedPerformerResult,
} from "./types";

function toEventContext(input: RecommendationInput): EventContext {
  return {
    eventTypeId: input.eventTypeId,
    budget: input.budget,
    guests: input.guests,
    city: input.city,
    languageIds: input.languageIds,
    genreIds: input.genreIds,
    eventDate: input.eventDate,
  };
}

function rankPerformers(
  profiles: readonly PerformerProfile[],
  context: EventContext,
): RecommendedPerformerResult[] {
  return profiles
    .map((performer) => {
      const breakdown = computeCompatibility(performer, context);
      return {
        performer,
        compatibilityScore: breakdown.overallMatch,
        breakdown,
        reasons: compatibilityReasons(performer, context, breakdown),
      };
    })
    .sort((left, right) => right.compatibilityScore - left.compatibilityScore);
}

function suggestInstruments(
  input: RecommendationInput,
  performers: readonly RecommendedPerformerResult[],
): string[] {
  const instrumentScores = new Map<string, number>();

  for (const result of performers.slice(0, 8)) {
    for (const instrumentId of result.performer.instrumentIds) {
      instrumentScores.set(instrumentId, (instrumentScores.get(instrumentId) ?? 0) + 2);
    }
  }

  if (input.genreIds.includes("garba") || input.eventTypeId === "garba") {
    instrumentScores.set("dhol", (instrumentScores.get("dhol") ?? 0) + 4);
    instrumentScores.set("dholak", (instrumentScores.get("dholak") ?? 0) + 2);
  }
  if (input.eventTypeId === "wedding" || input.eventTypeId === "reception") {
    instrumentScores.set("dhol", (instrumentScores.get("dhol") ?? 0) + 3);
    instrumentScores.set("shehnai", (instrumentScores.get("shehnai") ?? 0) + 2);
  }
  if (input.eventTypeId === "temple") {
    instrumentScores.set("tabla", (instrumentScores.get("tabla") ?? 0) + 3);
    instrumentScores.set("harmonium", (instrumentScores.get("harmonium") ?? 0) + 2);
  }

  return [...instrumentScores.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([instrumentId]) => instrumentId);
}

function estimateBudget(
  input: RecommendationInput,
  performers: readonly RecommendedPerformerResult[],
): number {
  if (!performers.length) return input.budget;
  const prices = performers
    .slice(0, 5)
    .flatMap((result) =>
      result.performer.pricingPackages.map(
        (pricingPackage) => pricingPackage.price.amount,
      ),
    );
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const guestFactor = input.guests > 500 ? 1.15 : input.guests > 200 ? 1.08 : 1;
  return Math.round(Math.min(input.budget, average * guestFactor));
}

function buildSummaryReasons(
  input: RecommendationInput,
  topResults: readonly RecommendedPerformerResult[],
  suggestedInstrumentIds: readonly string[],
): string[] {
  const reasons: string[] = [];
  const eventType =
    eventTypeRegistry[input.eventTypeId as keyof typeof eventTypeRegistry];

  if (eventType) {
    reasons.push(`Curated for ${eventType.label.toLowerCase()} events in ${input.city}.`);
  }

  if (suggestedInstrumentIds.length) {
    reasons.push(
      `Suggested instruments: ${suggestedInstrumentIds
        .map((id) => taxonomyLabel(id, instruments))
        .join(", ")}.`,
    );
  }

  if (topResults.length) {
    reasons.push(
      `Top match ${topResults[0].performer.displayName} scores ${topResults[0].compatibilityScore}% compatibility.`,
    );
  }

  if (input.languageIds.length) {
    reasons.push("Language preferences were included in the scoring model.");
  }

  return reasons.slice(0, 4);
}

export function getRecommendations(input: RecommendationInput): RecommendationResult {
  const context = toEventContext(input);
  const eventType =
    eventTypeRegistry[input.eventTypeId as keyof typeof eventTypeRegistry];

  const candidates = filterPerformers(mockPerformerProfiles, {
    city: input.city,
    maximumBudget: input.budget,
    languageIds: input.languageIds.length ? input.languageIds : undefined,
    genreIds: input.genreIds.length ? input.genreIds : eventType?.suggestedGenreIds,
    eventTypeId: input.eventTypeId,
    availableOn: input.eventDate,
  });

  const pool =
    candidates.length >= 3
      ? candidates
      : filterPerformers(mockPerformerProfiles, {
          maximumBudget: Math.round(input.budget * 1.25),
          eventTypeId: input.eventTypeId,
        });

  const ranked = rankPerformers(pool.length ? pool : mockPerformerProfiles, context);
  const performers = ranked.filter(
    ({ performer }) => performer.kind === "solo" || performer.kind === "dj",
  );
  const bands = ranked.filter(
    ({ performer }) => performer.kind === "band" || performer.kind === "ensemble",
  );
  const traditionalGroups = ranked.filter(
    ({ performer }) => performer.kind === "traditional-group",
  );
  const suggestedInstrumentIds = suggestInstruments(input, ranked);
  const estimatedAmount = estimateBudget(input, ranked);
  const topOverall = ranked.slice(0, 6);
  const compatibilityScore = topOverall.length
    ? Math.round(
        topOverall.reduce((sum, item) => sum + item.compatibilityScore, 0) /
          topOverall.length,
      )
    : 0;

  return {
    performers: performers.slice(0, 6),
    bands: bands.slice(0, 4),
    traditionalGroups: traditionalGroups.slice(0, 4),
    suggestedInstrumentIds,
    estimatedBudget: { amount: estimatedAmount, currency: "INR" },
    reasons: buildSummaryReasons(input, topOverall, suggestedInstrumentIds),
    compatibilityScore,
  };
}
