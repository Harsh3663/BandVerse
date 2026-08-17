import { createAppError } from "@/backend/shared/errors";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import { logger } from "@/backend/infrastructure/observability/logger";

interface AttemptState {
  failures: number;
  lockedUntil?: number;
}

const attempts = new Map<string, AttemptState>();

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export function assertNotBruteForced(key: string): void {
  const state = attempts.get(key);
  if (!state?.lockedUntil) return;
  if (state.lockedUntil > Date.now()) {
    incrementMetric("auth_bruteforce_blocked_total");
    throw createAppError(
      "RATE_LIMITED",
      "Too many failed login attempts. Try again later.",
    );
  }
  attempts.delete(key);
}

export function recordAuthFailure(key: string): void {
  const state = attempts.get(key) ?? { failures: 0 };
  state.failures += 1;
  if (state.failures >= MAX_FAILURES) {
    state.lockedUntil = Date.now() + LOCK_MS;
    logger.warn("Brute-force lockout engaged", { userId: key });
    incrementMetric("auth_bruteforce_lockouts_total");
  }
  attempts.set(key, state);
}

export function clearAuthFailures(key: string): void {
  attempts.delete(key);
}

export function detectSuspiciousActivity(input: {
  userId?: string;
  ipAddress?: string;
  path: string;
  status: number;
}): void {
  if (input.status === 401 || input.status === 403) {
    incrementMetric("security_suspicious_total");
    logger.warn("Suspicious activity signal", {
      userId: input.userId,
      ipAddress: input.ipAddress,
      route: input.path,
      status: input.status,
    });
  }
}
