import { createMemoryCache } from "./memory-cache";
import { tryCreateRedisCache } from "./redis-cache";
import {
  cacheKey,
  defaultCacheTtl,
  type CachePort,
  type CacheSetOptions,
} from "./types";

export type { CachePort };

export interface CacheService {
  readonly port: CachePort;
  readonly backend: "redis" | "memory";
  getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<T>;
  remember<T>(
    parts: readonly (string | number | undefined)[],
    loader: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<T>;
  invalidateNamespace(namespace: string): Promise<number>;
  invalidateTags(tags: readonly string[]): Promise<number>;
}

function wrapPort(port: CachePort, backend: "redis" | "memory"): CacheService {
  return {
    port,
    backend,
    async getOrSet(key, loader, options) {
      const cached = await port.get(key);
      if (cached !== undefined) return cached as Awaited<ReturnType<typeof loader>>;
      const value = await loader();
      await port.set(key, value, options);
      return value;
    },
    async remember(parts, loader, options) {
      return this.getOrSet(cacheKey(parts), loader, options);
    },
    async invalidateNamespace(namespace) {
      return port.delByPrefix(namespace);
    },
    async invalidateTags(tags) {
      return port.invalidateTags(tags);
    },
  };
}

/** Sync factory used by DI container. Prefers Redis when REDIS_URL + ioredis available. */
export function createCacheServiceSync(): CacheService {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require("ioredis").default as new (url: string) => {
        get(key: string): Promise<string | null>;
        set(key: string, value: string, mode: string, ttl: number): Promise<unknown>;
        del(...keys: string[]): Promise<number>;
        keys(pattern: string): Promise<string[]>;
        sadd(key: string, ...members: string[]): Promise<number>;
        smembers(key: string): Promise<string[]>;
      };
      const client = new Redis(redisUrl);
      const tagKey = (tag: string) => `bv:tag:${tag}`;
      const redisPort: CachePort = {
        async get(key) {
          const raw = await client.get(key);
          return raw ? (JSON.parse(raw) as never) : undefined;
        },
        async set(key, value, options) {
          await client.set(key, JSON.stringify(value), "EX", options?.ttlSeconds ?? 60);
          for (const tag of options?.tags ?? []) {
            await client.sadd(tagKey(tag), key);
          }
        },
        async del(key) {
          await client.del(key);
        },
        async delByPrefix(prefix) {
          const keys = await client.keys(`${prefix}*`);
          return keys.length ? client.del(...keys) : 0;
        },
        async invalidateTags(tags) {
          let removed = 0;
          for (const tag of tags) {
            const keys = await client.smembers(tagKey(tag));
            if (keys.length) removed += await client.del(...keys);
            await client.del(tagKey(tag));
          }
          return removed;
        },
        async clear() {
          const keys = await client.keys("bv:*");
          if (keys.length) await client.del(...keys);
        },
      };
      return wrapPort(redisPort, "redis");
    } catch {
      // Fall through to memory.
    }
  }
  return wrapPort(createMemoryCache(), "memory");
}

export async function createCacheService(): Promise<CacheService> {
  const redis = await tryCreateRedisCache();
  return wrapPort(redis ?? createMemoryCache(), redis ? "redis" : "memory");
}

export { cacheKey, defaultCacheTtl };
