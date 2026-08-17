import type { PlatformRepositories } from "@/backend/application/ports/repositories";
import type { CacheService } from "@/backend/infrastructure/cache";
import { defaultCacheTtl } from "@/backend/infrastructure/cache";
import type { createSwrCache } from "@/backend/infrastructure/cache/swr-cache";
import { paginate, type PaginatedResult, type PaginationQuery } from "@/backend/shared/pagination";
import type {
  MarketplaceEvent,
  PerformerProfile,
  VenueProfile,
} from "@/modules/marketplace/types";

export type SearchSort = "relevance" | "rating" | "name" | "date";

export interface SearchQuery extends PaginationQuery {
  readonly city?: string;
  readonly categoryIds?: readonly string[];
  readonly keyword?: string;
  readonly sort?: SearchSort;
  /** When set, filter performers by kind (e.g. band vs solo). */
  readonly kind?: PerformerProfile["kind"];
}

export interface SearchService {
  searchPerformers(query: SearchQuery): Promise<PaginatedResult<PerformerProfile>>;
  searchBands(query: SearchQuery): Promise<PaginatedResult<PerformerProfile>>;
  searchVenues(query: SearchQuery): Promise<PaginatedResult<VenueProfile>>;
  searchEvents(query: SearchQuery): Promise<PaginatedResult<MarketplaceEvent>>;
}

function matchesKeyword(haystack: string, keyword?: string): boolean {
  if (!keyword?.trim()) return true;
  return haystack.toLocaleLowerCase("en-IN").includes(keyword.trim().toLocaleLowerCase("en-IN"));
}

/**
 * Production search facade.
 * Current implementation uses repository data + SWR cache.
 * Swap internals for Postgres FTS (`tsvector`) or Elasticsearch without changing callers.
 */
export function createSearchService(
  repositories: PlatformRepositories,
  cache: CacheService,
  swrCache?: ReturnType<typeof createSwrCache>,
  options?: {
    getDiscoveryBoost?: (performerId: string) => Promise<number>;
  },
): SearchService {
  const remember = <T>(
    parts: readonly string[],
    loader: () => Promise<T>,
    tags: readonly string[],
  ) => {
    const key = parts.join(":");
    if (swrCache) {
      return swrCache.rememberSwr(key, loader, {
        ttlSeconds: defaultCacheTtl.search,
        staleSeconds: Math.floor(defaultCacheTtl.search / 2),
        tags: [...tags],
      });
    }
    return cache.remember(parts, loader, {
      ttlSeconds: defaultCacheTtl.search,
      tags: [...tags],
    });
  };

  return {
    async searchPerformers(query) {
      return remember(
        ["search", "performers", JSON.stringify(query)],
        async () => {
          const all = await repositories.performers.list();
          const filtered = all.filter((performer) => {
            if (query.kind && performer.kind !== query.kind) return false;
            if (
              query.city &&
              performer.travel.baseLocation.city.toLocaleLowerCase("en-IN") !==
                query.city.toLocaleLowerCase("en-IN")
            ) {
              return false;
            }
            if (
              query.categoryIds?.length &&
              !query.categoryIds.some((id) => performer.categoryIds.includes(id))
            ) {
              return false;
            }
            const keyword = query.keyword ?? query.q;
            const haystack = `${performer.displayName} ${performer.headline} ${performer.handle}`;
            if (!matchesKeyword(haystack, keyword)) return false;
            return true;
          });

          const keyword = (query.keyword ?? query.q ?? "").trim().toLocaleLowerCase("en-IN");
          const boostEntries = options?.getDiscoveryBoost
            ? await Promise.all(
                filtered.map(async (p) => [
                  p.id,
                  await options.getDiscoveryBoost!(p.id),
                ] as const),
              )
            : [];
          const boostById = new Map(boostEntries);

          const sorted = [...filtered].sort((a, b) => {
            if (query.sort === "relevance" && keyword) {
              const score = (p: PerformerProfile) => {
                const name = p.displayName.toLocaleLowerCase("en-IN");
                if (name === keyword) return 3;
                if (name.startsWith(keyword)) return 2;
                if (name.includes(keyword)) return 1;
                return 0;
              };
              const diff = score(b) - score(a);
              if (diff !== 0) return diff;
            }
            if (query.sort === "name" || query.sortOrder === "asc") {
              return a.displayName.localeCompare(b.displayName);
            }
            const boostDiff =
              (boostById.get(b.id) ?? 0) - (boostById.get(a.id) ?? 0);
            if (boostDiff !== 0) return boostDiff;
            return b.rating.average - a.rating.average;
          });

          return paginate(sorted, query);
        },
        ["search", "performers"],
      );
    },

    async searchBands(query) {
      return this.searchPerformers({ ...query, kind: "band" });
    },

    async searchVenues(query) {
      return remember(
        ["search", "venues", JSON.stringify(query)],
        async () => {
          const all = await repositories.venues.list();
          const filtered = all.filter((venue) => {
            if (
              query.city &&
              venue.location.city.toLocaleLowerCase("en-IN") !==
                query.city.toLocaleLowerCase("en-IN")
            ) {
              return false;
            }
            const keyword = query.keyword ?? query.q;
            return matchesKeyword(
              `${venue.name} ${venue.description} ${venue.handle}`,
              keyword,
            );
          });
          const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
          return paginate(sorted, query);
        },
        ["search", "venues"],
      );
    },

    async searchEvents(query) {
      return remember(
        ["search", "events", JSON.stringify(query)],
        async () => {
          const all = await repositories.events.list();
          const filtered = all.filter((event) => {
            if (
              query.city &&
              event.location.city.toLocaleLowerCase("en-IN") !==
                query.city.toLocaleLowerCase("en-IN")
            ) {
              return false;
            }
            const keyword = query.keyword ?? query.q;
            return matchesKeyword(
              `${event.title} ${event.description ?? ""} ${event.eventTypeId}`,
              keyword,
            );
          });
          const sorted = [...filtered].sort((a, b) =>
            query.sortOrder === "asc"
              ? a.startsAt.localeCompare(b.startsAt)
              : b.startsAt.localeCompare(a.startsAt),
          );
          return paginate(sorted, query);
        },
        ["search", "events"],
      );
    },
  };
}

/** Adapter notes for future engines (not dependencies). */
export const searchEnginePlan = {
  postgresFts: {
    performers: "to_tsvector(display_name || ' ' || headline || ' ' || biography)",
    venues: "to_tsvector(name || ' ' || description)",
    events: "to_tsvector(title || ' ' || coalesce(description,''))",
  },
  elasticsearch: {
    indices: ["performers", "venues", "events"],
    sync: "outbox → worker → bulk index",
  },
} as const;
