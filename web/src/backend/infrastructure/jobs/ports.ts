export type JobName =
  | "booking.process"
  | "recommendation.generate"
  | "analytics.aggregate"
  | "notification.email"
  | "notification.push"
  | "payment.reconcile"
  | "payment.settle"
  | "search.index";

export interface JobPayloadMap {
  "booking.process": { bookingId: string };
  "recommendation.generate": { requestId: string; inputHash: string };
  "analytics.aggregate": { subjectType: string; subjectId: string };
  "notification.email": {
    to: string;
    template: string;
    data: Record<string, string>;
  };
  "notification.push": { userId: string; title: string; body: string };
  "payment.reconcile": { paymentId: string; provider: string };
  "payment.settle": { paymentId: string };
  "search.index": { entityType: string; entityId: string };
}

export interface Job<TName extends JobName = JobName> {
  readonly id: string;
  readonly name: TName;
  readonly payload: JobPayloadMap[TName];
  attempts: number;
  readonly maxAttempts: number;
  availableAt: number;
  readonly createdAt: number;
}

export interface JobPort {
  handle<TName extends JobName>(
    name: TName,
    handler: (job: Job<TName>) => Promise<void>,
  ): void;
  processDue(limit?: number): Promise<number>;
}

export interface QueuePort {
  enqueue<TName extends JobName>(
    name: TName,
    payload: JobPayloadMap[TName],
    options?: { delayMs?: number; maxAttempts?: number },
  ): Promise<Job<TName>>;
  size(): Promise<number>;
}

export interface SchedulerPort {
  schedule(
    name: JobName,
    cronExpression: string,
    payload: JobPayloadMap[JobName],
  ): Promise<void>;
  list(): Promise<readonly { name: JobName; cronExpression: string }[]>;
}
