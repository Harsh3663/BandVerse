import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import type { PortfolioService } from "@/backend/infrastructure/portfolio/portfolio-service";
import {
  createTalentMatchingEngine,
  type EventMatchResult,
  type MatchingAnalyticsSnapshot,
  type MatchingEventContext,
  type PerformerMatchBundles,
  type VenueMatchResult,
} from "@/modules/matching";
import { notFoundError, validationError } from "@/backend/shared/errors";

export type MatchingAnalyticsEvent =
  | "impression"
  | "click"
  | "application"
  | "booking";

export interface MatchingService {
  matchPerformers(context: MatchingEventContext): Promise<PerformerMatchBundles>;
  matchVenues(context: MatchingEventContext): Promise<readonly VenueMatchResult[]>;
  suggestEventsForPerformer(
    performerId: string,
    limit?: number,
  ): Promise<readonly EventMatchResult[]>;
  track(event: MatchingAnalyticsEvent): Promise<MatchingAnalyticsSnapshot>;
  getAnalytics(): Promise<MatchingAnalyticsSnapshot>;
}

function snapshot(counters: {
  impressions: number;
  clicks: number;
  applications: number;
  bookings: number;
}): MatchingAnalyticsSnapshot {
  const clickThroughRate =
    counters.impressions === 0
      ? 0
      : Math.round((counters.clicks / counters.impressions) * 10_000) / 10_000;
  const conversionRate =
    counters.clicks === 0
      ? 0
      : Math.round((counters.bookings / counters.clicks) * 10_000) / 10_000;
  return { ...counters, clickThroughRate, conversionRate };
}

export function createMatchingService(options: {
  repositories: PlatformRepositories;
  /** Read-only portfolio hooks — does not modify portfolio module. */
  portfolio?: Pick<PortfolioService, "portfolioCompleteness">;
}): MatchingService {
  const counters = {
    impressions: 0,
    clicks: 0,
    applications: 0,
    bookings: 0,
  };

  const completenessCache = new Map<string, number>();

  const engine = createTalentMatchingEngine({
    getPortfolioCompleteness: (performerId) => completenessCache.get(performerId),
  });

  async function warmCompleteness(performerIds: readonly string[]) {
    if (!options.portfolio) return;
    await Promise.all(
      performerIds.map(async (id) => {
        if (completenessCache.has(id)) return;
        try {
          const value = await options.portfolio!.portfolioCompleteness(id);
          completenessCache.set(id, value);
        } catch {
          completenessCache.set(id, 0);
        }
      }),
    );
  }

  function assertContext(context: MatchingEventContext) {
    if (!context.eventTypeId?.trim()) {
      throw validationError("eventTypeId is required.");
    }
    if (!context.city?.trim()) throw validationError("city is required.");
    if (!Number.isFinite(context.budget) || context.budget <= 0) {
      throw validationError("budget must be a positive number.");
    }
  }

  return {
    async matchPerformers(context) {
      assertContext(context);
      const performers = await options.repositories.performers.list();
      await warmCompleteness(performers.map((p) => p.id));
      const bundles = engine.matchPerformers(performers, context);
      counters.impressions +=
        bundles.topPerformers.length +
        bundles.topBands.length +
        bundles.topLocal.length;
      return bundles;
    },

    async matchVenues(context) {
      assertContext(context);
      const venues = await options.repositories.venues.list();
      const ranked = engine.matchVenues(venues, context);
      counters.impressions += ranked.length;
      return ranked;
    },

    async suggestEventsForPerformer(performerId, limit = 10) {
      const performer = await options.repositories.performers.getById(performerId);
      if (!performer) throw notFoundError("Performer", performerId);
      await warmCompleteness([performerId]);
      const events = await options.repositories.events.list();
      const suggestions = engine.suggestEventsForPerformer(
        performer,
        events,
        limit,
      );
      counters.impressions += suggestions.length;
      return suggestions;
    },

    async track(event) {
      switch (event) {
        case "impression":
          counters.impressions += 1;
          break;
        case "click":
          counters.clicks += 1;
          break;
        case "application":
          counters.applications += 1;
          break;
        case "booking":
          counters.bookings += 1;
          break;
        default:
          throw validationError("Unsupported matching analytics event.");
      }
      return snapshot(counters);
    },

    async getAnalytics() {
      return snapshot(counters);
    },
  };
}
