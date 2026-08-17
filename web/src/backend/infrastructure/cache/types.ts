export interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number;
}

export interface CacheSetOptions {
  readonly ttlSeconds?: number;
  readonly tags?: readonly string[];
}

export interface CachePort {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void>;
  del(key: string): Promise<void>;
  delByPrefix(prefix: string): Promise<number>;
  invalidateTags(tags: readonly string[]): Promise<number>;
  clear(): Promise<void>;
}

export const defaultCacheTtl = {
  performersList: 60,
  venuesList: 60,
  recommendations: 120,
  analytics: 90,
  search: 45,
} as const;

export function cacheKey(parts: readonly (string | number | undefined)[]): string {
  return parts
    .filter((part) => part !== undefined && part !== "")
    .map(String)
    .join(":");
}
