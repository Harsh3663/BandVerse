import { getRecommendations } from "@/modules/marketplace/recommendations";
import type {
  RecommendationInput,
  RecommendationResult,
  RecommendedPerformerResult,
} from "@/modules/marketplace/types";
import type { PortfolioService } from "@/backend/infrastructure/portfolio/portfolio-service";
import { ok, type Result } from "@/backend/shared/result";

function sortByDiscovery(
  items: readonly RecommendedPerformerResult[],
  order: Map<string, number>,
): RecommendedPerformerResult[] {
  return [...items].sort((a, b) => {
    const ai = order.get(a.performer.id) ?? Number.MAX_SAFE_INTEGER;
    const bi = order.get(b.performer.id) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return b.compatibilityScore - a.compatibilityScore;
  });
}

/**
 * Wraps the existing recommendation engine and applies discovery boost ranking
 * (rating, verified performances, portfolio completeness, response time, booking success).
 */
export async function recommendPerformersUseCase(
  input: RecommendationInput,
  portfolio?: PortfolioService,
): Promise<Result<RecommendationResult>> {
  const base = getRecommendations(input);
  const combined = [
    ...base.performers,
    ...base.bands,
    ...base.traditionalGroups,
  ];
  if (!portfolio || combined.length === 0) {
    return ok(base);
  }

  const ranked = await portfolio.rankPerformers(
    combined.map((r) => r.performer.id),
  );
  const order = new Map(ranked.map((r, index) => [r.performerId, index]));

  return ok({
    ...base,
    performers: sortByDiscovery(base.performers, order),
    bands: sortByDiscovery(base.bands, order),
    traditionalGroups: sortByDiscovery(base.traditionalGroups, order),
  });
}
