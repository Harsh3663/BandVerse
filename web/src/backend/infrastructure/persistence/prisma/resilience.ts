import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";

export interface RetryOptions {
  readonly retries?: number;
  readonly baseDelayMs?: number;
  readonly onRetry?: (attempt: number, error: unknown) => void;
}

export class CircuitOpenError extends Error {
  constructor(message = "Database circuit breaker is open.") {
    super(message);
    this.name = "CircuitOpenError";
  }
}

export function createCircuitBreaker(options?: {
  failureThreshold?: number;
  coolDownMs?: number;
}) {
  const failureThreshold = options?.failureThreshold ?? 5;
  const coolDownMs = options?.coolDownMs ?? 30_000;
  let failures = 0;
  let openedAt: number | undefined;

  return {
    async exec<T>(fn: () => Promise<T>): Promise<T> {
      if (openedAt && Date.now() - openedAt < coolDownMs) {
        incrementMetric("db_circuit_open_total");
        throw new CircuitOpenError();
      }
      if (openedAt && Date.now() - openedAt >= coolDownMs) {
        openedAt = undefined;
        failures = 0;
      }
      try {
        const result = await fn();
        failures = 0;
        return result;
      } catch (error) {
        failures += 1;
        if (failures >= failureThreshold) {
          openedAt = Date.now();
          logger.warn("DB circuit breaker opened", { failures });
        }
        throw error;
      }
    },
    state() {
      return openedAt ? ("open" as const) : ("closed" as const);
    },
  };
}

function isRetryable(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error);
  return (
    message.includes("deadlock") ||
    message.includes("serialization") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("econnreset") ||
    message.includes("40p01")
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 50;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !isRetryable(error)) throw error;
      incrementMetric("db_retry_total");
      options.onRetry?.(attempt, error);
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)));
    }
  }
}

export async function withTransactionRetry<T>(
  runner: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  return withRetry(runner, {
    retries: options?.retries ?? 3,
    baseDelayMs: options?.baseDelayMs ?? 75,
    onRetry: (attempt, error) => {
      logger.warn("Retrying transaction", {
        attempt,
        cause: error instanceof Error ? error.message : String(error),
      });
      options?.onRetry?.(attempt, error);
    },
  });
}

export const dbCircuitBreaker = createCircuitBreaker();
