import type { RateLimitService } from "@/backend/application/ports/services";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import { createInMemoryRateLimitService } from "./rate-limit";

/**
 * Redis fixed-window rate limiter. Falls back to memory when Redis unavailable.
 */
export function createRateLimitServiceSync(): RateLimitService {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return createInMemoryRateLimitService();

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require("ioredis").default as new (url: string) => {
      incr(key: string): Promise<number>;
      pexpire(key: string, ms: number): Promise<number>;
      pttl(key: string): Promise<number>;
    };
    const client = new Redis(redisUrl);
    return {
      async consume(key, limit, windowMs) {
        const redisKey = `bv:rl:${key}`;
        const count = await client.incr(redisKey);
        if (count === 1) await client.pexpire(redisKey, windowMs);
        const ttl = await client.pttl(redisKey);
        const resetAt = Date.now() + (ttl > 0 ? ttl : windowMs);
        if (count > limit) {
          incrementMetric("rate_limit_blocked_total");
          return { allowed: false, remaining: 0, resetAt };
        }
        incrementMetric("rate_limit_allowed_total");
        return {
          allowed: true,
          remaining: Math.max(0, limit - count),
          resetAt,
        };
      },
    };
  } catch {
    return createInMemoryRateLimitService();
  }
}
