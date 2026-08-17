import { randomBytes } from "node:crypto";

import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import type {
  Job,
  JobName,
  JobPayloadMap,
  JobPort,
  QueuePort,
  SchedulerPort,
} from "./ports";

type Handler = (job: Job) => Promise<void>;

export function createMemoryJobSystem(): {
  queue: QueuePort;
  jobs: JobPort;
  scheduler: SchedulerPort;
} {
  const pending: Job[] = [];
  const handlers = new Map<JobName, Handler>();
  const schedules: { name: JobName; cronExpression: string; payload: JobPayloadMap[JobName] }[] =
    [];

  const queue: QueuePort = {
    async enqueue(name, payload, options) {
      const job: Job = {
        id: `job_${randomBytes(8).toString("hex")}`,
        name,
        payload,
        attempts: 0,
        maxAttempts: options?.maxAttempts ?? 3,
        availableAt: Date.now() + (options?.delayMs ?? 0),
        createdAt: Date.now(),
      };
      pending.push(job as Job);
      incrementMetric("jobs_enqueued_total");
      return job as Job<typeof name>;
    },
    async size() {
      return pending.length;
    },
  };

  const jobs: JobPort = {
    handle(name, handler) {
      handlers.set(name, handler as Handler);
    },
    async processDue(limit = 20) {
      const now = Date.now();
      let processed = 0;
      for (let i = 0; i < pending.length && processed < limit; ) {
        const job = pending[i];
        if (job.availableAt > now) {
          i += 1;
          continue;
        }
        pending.splice(i, 1);
        const handler = handlers.get(job.name);
        if (!handler) {
          logger.warn("No handler for job", { route: job.name });
          continue;
        }
        try {
          await handler(job);
          incrementMetric("jobs_processed_total");
          processed += 1;
        } catch (error) {
          job.attempts += 1;
          incrementMetric("jobs_failed_total");
          logger.error("Job failed", {
            route: job.name,
            requestId: job.id,
            cause: error instanceof Error ? error.message : String(error),
          });
          if (job.attempts < job.maxAttempts) {
            job.availableAt = Date.now() + job.attempts * 2_000;
            pending.push(job);
          }
        }
      }
      return processed;
    },
  };

  const scheduler: SchedulerPort = {
    async schedule(name, cronExpression, payload) {
      schedules.push({ name, cronExpression, payload });
    },
    async list() {
      return schedules.map(({ name, cronExpression }) => ({ name, cronExpression }));
    },
  };

  return { queue, jobs, scheduler };
}
