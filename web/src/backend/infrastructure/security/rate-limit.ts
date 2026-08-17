import type { RateLimitService } from "@/backend/application/ports/services";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window rate limiter for single-process deployments.
 * Production should use Redis / edge rate limiting.
 */
export function createInMemoryRateLimitService(): RateLimitService {
  const buckets = new Map<string, Bucket>();

  return {
    async consume(key, limit, windowMs) {
      const now = Date.now();
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= now) {
        const resetAt = now + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: limit - 1, resetAt };
      }

      if (existing.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: existing.resetAt };
      }

      existing.count += 1;
      return {
        allowed: true,
        remaining: Math.max(0, limit - existing.count),
        resetAt: existing.resetAt,
      };
    },
  };
}

export const defaultRateLimits = {
  publicRead: { limit: 120, windowMs: 60_000 },
  auth: { limit: 20, windowMs: 60_000 },
  write: { limit: 60, windowMs: 60_000 },
  mediaUpload: { limit: 20, windowMs: 60_000 },
  webhook: { limit: 300, windowMs: 60_000 },
  search: { limit: 90, windowMs: 60_000 },
} as const;
