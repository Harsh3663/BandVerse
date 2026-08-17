import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import type { JobPort, QueuePort } from "./ports";

/** Registers default BandVerse job handlers on the in-process worker. */
export function registerDefaultJobHandlers(jobs: JobPort, queue: QueuePort): void {
  jobs.handle("booking.process", async (job) => {
    logger.info("Processing booking job", {
      requestId: job.id,
      bookingId: job.payload.bookingId,
    });
    incrementMetric("business_bookings_processed_total");
    await queue.enqueue("notification.email", {
      to: "ops@bandverse.in",
      template: "booking-processed",
      data: { bookingId: job.payload.bookingId },
    });
  });

  jobs.handle("recommendation.generate", async (job) => {
    logger.info("Warming recommendations", {
      requestId: job.id,
      inputHash: job.payload.inputHash,
    });
    incrementMetric("business_recommendations_warmed_total");
  });

  jobs.handle("analytics.aggregate", async (job) => {
    logger.info("Aggregating analytics", {
      requestId: job.id,
      subjectType: job.payload.subjectType,
      subjectId: job.payload.subjectId,
    });
    incrementMetric("business_analytics_aggregated_total");
  });

  jobs.handle("notification.email", async (job) => {
    logger.info("Email notification queued for delivery", {
      requestId: job.id,
      to: job.payload.to,
      template: job.payload.template,
    });
    incrementMetric("business_emails_queued_total");
  });

  jobs.handle("payment.reconcile", async (job) => {
    logger.info("Reconciling payment", {
      requestId: job.id,
      paymentId: job.payload.paymentId,
      provider: job.payload.provider,
    });
    incrementMetric("business_payments_reconciled_total");
  });

  jobs.handle("payment.settle", async (job) => {
    logger.info("Settling payment", {
      requestId: job.id,
      paymentId: job.payload.paymentId,
    });
    incrementMetric("business_payments_settled_total");
  });

  jobs.handle("notification.push", async (job) => {
    logger.info("Push notification queued", {
      requestId: job.id,
      userId: job.payload.userId,
    });
    incrementMetric("notifications_sent_total");
  });

  jobs.handle("search.index", async (job) => {
    logger.info("Search index update", {
      requestId: job.id,
      entityType: job.payload.entityType,
      entityId: job.payload.entityId,
    });
    incrementMetric("search_index_jobs_total");
  });
}
