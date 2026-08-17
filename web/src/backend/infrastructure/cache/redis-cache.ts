import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import { logger } from "@/backend/infrastructure/observability/logger";
import type { CachePort, CacheSetOptions } from "./types";

type RedisLike = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: string, ttl: number): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  sadd(key: string, ...members: string[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  quit(): Promise<string>;
};

/**
 * Redis cache adapter. Uses dynamic import of `ioredis` when REDIS_URL is set.
 * Falls back gracefully if the package/connection is unavailable.
 *
 * Cluster-ready: keys are namespaced (`bv:tag:*`) without hash-slot assumptions.
 * Point REDIS_URL at a cluster-aware endpoint or use an ioredis Cluster client
 * wrapper in deployment without changing CachePort consumers.
 */
export async function tryCreateRedisCache(
  redisUrl = process.env.REDIS_URL,
): Promise<CachePort | undefined> {
  if (!redisUrl?.trim()) return undefined;

  try {
    // Optional dependency — production images should include ioredis.
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<{ default: new (url: string) => RedisLike }>;
    const mod = await dynamicImport("ioredis").catch(() => null);
    if (!mod?.default) {
      logger.warn("ioredis not installed; Redis cache disabled");
      return undefined;
    }

    const client = new mod.default(redisUrl);
    const tagKey = (tag: string) => `bv:tag:${tag}`;

    return {
      async get<T>(key: string) {
        const raw = await client.get(key);
        if (!raw) {
          incrementMetric("cache_miss_total");
          return undefined;
        }
        incrementMetric("cache_hit_total");
        return JSON.parse(raw) as T;
      },

      async set<T>(key: string, value: T, options?: CacheSetOptions) {
        const ttl = options?.ttlSeconds ?? 60;
        await client.set(key, JSON.stringify(value), "EX", ttl);
        for (const tag of options?.tags ?? []) {
          await client.sadd(tagKey(tag), key);
        }
      },

      async del(key: string) {
        await client.del(key);
      },

      async delByPrefix(prefix: string) {
        const keys = await client.keys(`${prefix}*`);
        if (!keys.length) return 0;
        return client.del(...keys);
      },

      async invalidateTags(tags: readonly string[]) {
        let removed = 0;
        for (const tag of tags) {
          const keys = await client.smembers(tagKey(tag));
          if (keys.length) {
            removed += await client.del(...keys);
          }
          await client.del(tagKey(tag));
        }
        return removed;
      },

      async clear() {
        const keys = await client.keys("bv:*");
        if (keys.length) await client.del(...keys);
      },
    };
  } catch (error) {
    logger.warn("Redis cache unavailable", {
      cause: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}
