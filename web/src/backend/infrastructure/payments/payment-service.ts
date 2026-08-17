import { createHash } from "node:crypto";

import type { QueuePort } from "@/backend/infrastructure/jobs";
import { writeImmutableAudit } from "@/backend/infrastructure/audit/audit-framework";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import type { EventBus } from "@/backend/infrastructure/events/event-bus";
import type { PrismaClient } from "@prisma/client";
import {
  createPaymentReliabilityService,
  recordMemoryWebhook,
  type PaymentReliabilityService,
} from "./ledger";
import { resolvePaymentProvider } from "./providers";
import type {
  CreatePaymentIntentInput,
  NormalizedWebhookEvent,
  PaymentIntentResult,
  PaymentProvider,
  WebhookVerificationInput,
} from "./types";

const processedWebhooks = new Set<string>();

export interface PaymentService {
  readonly provider: PaymentProvider;
  readonly reliability: PaymentReliabilityService;
  createIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  handleWebhook(input: WebhookVerificationInput): Promise<NormalizedWebhookEvent>;
  reconcile(providerReference: string): Promise<PaymentIntentResult>;
}

export function createPaymentService(options: {
  queue: QueuePort;
  prisma?: PrismaClient;
  provider?: PaymentProvider;
  eventBus?: EventBus;
}): PaymentService {
  const provider = options.provider ?? resolvePaymentProvider();
  const reliability = createPaymentReliabilityService({
    prisma: options.prisma,
    queue: options.queue,
  });

  return {
    provider,
    reliability,
    async createIntent(input) {
      const result = await provider.createIntent(input);
      incrementMetric("payments_intents_created_total");
      await reliability.writeLedger({
        bookingId: input.bookingId,
        entryType: "authorization",
        amountPaise: Math.round(input.amount.amount * 100),
        direction: "debit",
        reference: `intent:${input.idempotencyKey}`,
        metadata: { provider: provider.name, kind: input.kind },
      });
      await writeImmutableAudit(options.prisma, {
        action: "payment.intent_created",
        resource: "payment",
        resourceId: result.providerReference,
        after: {
          bookingId: input.bookingId,
          idempotencyKey: input.idempotencyKey,
          provider: provider.name,
          amount: input.amount.amount,
        },
      });
      return result;
    },

    async handleWebhook(input) {
      const event = await provider.verifyWebhook(input);

      if (options.prisma) {
        const existing = await options.prisma.webhookDelivery.findUnique({
          where: { idempotencyKey: event.idempotencyKey },
        });
        if (existing?.status === "processed") {
          incrementMetric("payments_webhook_duplicates_total");
          return event;
        }
        await options.prisma.webhookDelivery.upsert({
          where: { idempotencyKey: event.idempotencyKey },
          update: {
            status: "received",
            eventType: event.eventType,
            providerReference: event.providerReference,
            payloadJson: event.raw as object,
          },
          create: {
            provider: event.provider,
            idempotencyKey: event.idempotencyKey,
            eventType: event.eventType,
            providerReference: event.providerReference,
            payloadJson: event.raw as object,
            status: "received",
          },
        });
      } else if (processedWebhooks.has(event.idempotencyKey)) {
        incrementMetric("payments_webhook_duplicates_total");
        return event;
      } else {
        processedWebhooks.add(event.idempotencyKey);
        recordMemoryWebhook({
          idempotencyKey: event.idempotencyKey,
          provider: event.provider,
          eventType: event.eventType,
          providerReference: event.providerReference,
          payload: event.raw,
        });
      }

      try {
        incrementMetric("payments_webhooks_processed_total");
        if (event.status === "paid" && event.amount) {
          await reliability.writeLedger({
            entryType: "capture",
            amountPaise: Math.round(event.amount.amount * 100),
            direction: "credit",
            reference: `capture:${event.idempotencyKey}`,
            metadata: { providerReference: event.providerReference },
          });
          await options.eventBus?.publish("PaymentCompleted", {
            providerReference: event.providerReference,
            amount: event.amount.amount,
          });
        }
        if (event.status === "refunded" && event.amount) {
          await reliability.writeLedger({
            entryType: "refund",
            amountPaise: Math.round(event.amount.amount * 100),
            direction: "debit",
            reference: `refund:${event.idempotencyKey}`,
            metadata: { providerReference: event.providerReference },
          });
        }

        await writeImmutableAudit(options.prisma, {
          action: "payment.webhook",
          resource: "payment",
          resourceId: event.providerReference,
          after: {
            eventType: event.eventType,
            status: event.status,
            idempotencyKey: event.idempotencyKey,
          },
        });

        await options.queue.enqueue("payment.reconcile", {
          paymentId: event.providerReference,
          provider: event.provider,
        });

        if (options.prisma) {
          await options.prisma.webhookDelivery.update({
            where: { idempotencyKey: event.idempotencyKey },
            data: { status: "processed", processedAt: new Date() },
          });
        }
      } catch (error) {
        if (options.prisma) {
          await options.prisma.webhookDelivery.update({
            where: { idempotencyKey: event.idempotencyKey },
            data: {
              status: "failed",
              attempts: { increment: 1 },
              lastError: error instanceof Error ? error.message : String(error),
            },
          });
        }
        throw error;
      }

      return event;
    },

    async reconcile(providerReference) {
      const result = await provider.reconcile(providerReference);
      incrementMetric("payments_reconcile_total");
      await reliability.writeLedger({
        entryType: "settlement",
        amountPaise: 0,
        direction: "credit",
        reference: `reconcile:${providerReference}:${Date.now()}`,
      });
      return result;
    },
  };
}

export function paymentIdempotencyKey(parts: {
  bookingId: string;
  kind: string;
  amount: number;
}): string {
  return createHash("sha256")
    .update(`${parts.bookingId}:${parts.kind}:${parts.amount}`)
    .digest("hex")
    .slice(0, 32);
}
