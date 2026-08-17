import type { CacheService } from "./cache-service";
import type { CacheSetOptions } from "./types";
import type { EventBus } from "@/backend/infrastructure/events/event-bus";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";

interface SwrEnvelope<T> {
  readonly value: T;
  readonly staleAt: number;
  readonly expiresAt: number;
}

/**
 * Stale-while-revalidate helper on top of existing CacheService.
 * Serves stale value immediately while refreshing in background.
 */
export function createSwrCache(cache: CacheService, eventBus?: EventBus) {
  if (eventBus) {
    eventBus.subscribe("CacheInvalidate", async (event) => {
      const tags = event.payload.tags;
      if (Array.isArray(tags)) {
        await cache.invalidateTags(tags.map(String));
      }
      const namespace = event.payload.namespace;
      if (typeof namespace === "string") {
        await cache.invalidateNamespace(namespace);
      }
    });
  }

  return {
    async rememberSwr<T>(
      key: string,
      loader: () => Promise<T>,
      options?: CacheSetOptions & { staleSeconds?: number },
    ): Promise<T> {
      const ttlSeconds = options?.ttlSeconds ?? 60;
      const staleSeconds = options?.staleSeconds ?? Math.floor(ttlSeconds / 2);
      const envelope = await cache.port.get<SwrEnvelope<T>>(key);
      const now = Date.now();

      if (envelope && envelope.expiresAt > now) {
        incrementMetric("cache_hit_total");
        if (envelope.staleAt <= now) {
          void loader()
            .then(async (value) => {
              await cache.port.set(
                key,
                {
                  value,
                  staleAt: Date.now() + staleSeconds * 1000,
                  expiresAt: Date.now() + ttlSeconds * 1000,
                } satisfies SwrEnvelope<T>,
                options,
              );
              incrementMetric("cache_swr_refresh_total");
            })
            .catch(() => {
              incrementMetric("cache_swr_refresh_failed_total");
            });
        }
        return envelope.value;
      }

      incrementMetric("cache_miss_total");
      const value = await loader();
      await cache.port.set(
        key,
        {
          value,
          staleAt: Date.now() + staleSeconds * 1000,
          expiresAt: Date.now() + ttlSeconds * 1000,
        } satisfies SwrEnvelope<T>,
        options,
      );
      return value;
    },

    async warm(
      entries: readonly {
        key: string;
        loader: () => Promise<unknown>;
        options?: CacheSetOptions;
      }[],
    ) {
      for (const entry of entries) {
        const value = await entry.loader();
        await cache.port.set(entry.key, value, entry.options);
        incrementMetric("cache_warm_total");
      }
    },

    async publishInvalidation(tags: readonly string[]) {
      if (!eventBus) {
        await cache.invalidateTags(tags);
        return;
      }
      await eventBus.publish("CacheInvalidate", { tags: [...tags] });
    },
  };
}
