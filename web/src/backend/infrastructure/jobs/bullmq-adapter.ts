import type { JobName, JobPayloadMap, QueuePort } from "./ports";
import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";

type BullQueue = {
  add: (
    name: string,
    data: unknown,
    opts?: {
      delay?: number;
      attempts?: number;
      backoff?: { type: string; delay: number };
      removeOnComplete?: boolean;
      removeOnFail?: boolean;
    },
  ) => Promise<{ id?: string }>;
  count: () => Promise<number>;
};

type BullMqModule = {
  Queue: new (
    name: string,
    options: { connection: { url: string } },
  ) => BullQueue;
};

async function loadBullMq(): Promise<BullMqModule | null> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<BullMqModule>;
    return await dynamicImport("bullmq");
  } catch {
    return null;
  }
}

/**
 * BullMQ queue with retries, exponential backoff, and DLQ naming convention.
 * Activates when REDIS_URL + bullmq are present.
 */
export async function tryCreateBullMqQueue(
  redisUrl = process.env.REDIS_URL,
): Promise<QueuePort | undefined> {
  if (!redisUrl?.trim()) return undefined;

  try {
    const bullmq = await loadBullMq();
    if (!bullmq?.Queue) {
      logger.info("bullmq not installed; using in-memory queue");
      return undefined;
    }

    const main = new bullmq.Queue("bandverse", {
      connection: { url: redisUrl },
    });
    const dlq = new bullmq.Queue("bandverse-dlq", {
      connection: { url: redisUrl },
    });

    return {
      async enqueue(name, payload, options) {
        const maxAttempts = options?.maxAttempts ?? 5;
        try {
          const result = await main.add(name, payload, {
            delay: options?.delayMs,
            attempts: maxAttempts,
            backoff: { type: "exponential", delay: 1_000 },
            removeOnComplete: true,
            removeOnFail: false,
          });
          incrementMetric("jobs_enqueued_total");
          return {
            id: String(result.id ?? `${name}-${Date.now()}`),
            name,
            payload,
            attempts: 0,
            maxAttempts,
            availableAt: Date.now() + (options?.delayMs ?? 0),
            createdAt: Date.now(),
          };
        } catch (error) {
          await dlq.add(`dlq:${name}`, {
            payload,
            error: error instanceof Error ? error.message : String(error),
          });
          incrementMetric("jobs_dlq_total");
          throw error;
        }
      },
      async size() {
        return main.count();
      },
    } satisfies QueuePort;
  } catch (error) {
    logger.warn("BullMQ adapter unavailable", {
      cause: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

export type BullMqJobHandlers = {
  [K in JobName]?: (payload: JobPayloadMap[K]) => Promise<void>;
};
