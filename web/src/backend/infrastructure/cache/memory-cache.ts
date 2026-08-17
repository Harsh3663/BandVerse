import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import type { CachePort, CacheSetOptions } from "./types";

interface MemoryRecord {
  value: unknown;
  expiresAt: number;
  tags: readonly string[];
}

export function createMemoryCache(defaultTtlSeconds = 60): CachePort {
  const store = new Map<string, MemoryRecord>();
  const tagIndex = new Map<string, Set<string>>();

  function purgeExpired(key: string, record: MemoryRecord): boolean {
    if (record.expiresAt <= Date.now()) {
      store.delete(key);
      incrementMetric("cache_eviction_total");
      return true;
    }
    return false;
  }

  return {
    async get<T>(key: string) {
      const record = store.get(key);
      if (!record) {
        incrementMetric("cache_miss_total");
        return undefined;
      }
      if (purgeExpired(key, record)) {
        incrementMetric("cache_miss_total");
        return undefined;
      }
      incrementMetric("cache_hit_total");
      return record.value as T;
    },

    async set<T>(key: string, value: T, options?: CacheSetOptions) {
      const ttl = options?.ttlSeconds ?? defaultTtlSeconds;
      const tags = options?.tags ?? [];
      store.set(key, {
        value,
        expiresAt: Date.now() + ttl * 1000,
        tags,
      });
      for (const tag of tags) {
        const keys = tagIndex.get(tag) ?? new Set<string>();
        keys.add(key);
        tagIndex.set(tag, keys);
      }
    },

    async del(key: string) {
      store.delete(key);
    },

    async delByPrefix(prefix: string) {
      let removed = 0;
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          store.delete(key);
          removed += 1;
        }
      }
      return removed;
    },

    async invalidateTags(tags: readonly string[]) {
      let removed = 0;
      for (const tag of tags) {
        const keys = tagIndex.get(tag);
        if (!keys) continue;
        for (const key of keys) {
          if (store.delete(key)) removed += 1;
        }
        tagIndex.delete(tag);
      }
      return removed;
    },

    async clear() {
      store.clear();
      tagIndex.clear();
    },
  };
}
