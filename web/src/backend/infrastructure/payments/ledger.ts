import type { PrismaClient } from "@prisma/client";

import { writeImmutableAudit } from "@/backend/infrastructure/audit/audit-framework";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";
import type { QueuePort } from "@/backend/infrastructure/jobs";

export interface LedgerWriteInput {
  readonly paymentId?: string;
  readonly bookingId?: string;
  readonly entryType: "authorization" | "capture" | "refund" | "settlement" | "adjustment";
  readonly amountPaise: number;
  readonly direction: "debit" | "credit";
  readonly reference: string;
  readonly metadata?: Record<string, unknown>;
}

export interface PaymentReliabilityService {
  writeLedger(input: LedgerWriteInput): Promise<void>;
  markSettled(paymentId: string): Promise<void>;
  recoverFailedWebhooks(limit?: number): Promise<number>;
  enqueueReconciliation(paymentId: string, provider: string): Promise<void>;
}

const memoryLedger: LedgerWriteInput[] = [];
const memoryWebhooks: {
  idempotencyKey: string;
  status: string;
  attempts: number;
  payload: unknown;
  provider: string;
  eventType: string;
  providerReference?: string;
}[] = [];

export function createPaymentReliabilityService(options: {
  prisma?: PrismaClient;
  queue: QueuePort;
}): PaymentReliabilityService {
  return {
    async writeLedger(input) {
      incrementMetric("ledger_entries_total");
      if (!options.prisma) {
        memoryLedger.push(input);
        return;
      }
      await options.prisma.ledgerEntry.create({
        data: {
          paymentId: input.paymentId,
          bookingId: input.bookingId,
          entryType: input.entryType,
          amountPaise: input.amountPaise,
          direction: input.direction,
          reference: input.reference,
          metadataJson: input.metadata as object | undefined,
        },
      });
      await writeImmutableAudit(options.prisma, {
        action: "ledger.write",
        resource: "ledger",
        resourceId: input.reference,
        after: input as unknown as Record<string, unknown>,
      });
    },

    async markSettled(paymentId) {
      if (!options.prisma) return;
      await options.prisma.payment.update({
        where: { id: paymentId },
        data: { settlementStatus: "settled", settledAt: new Date() },
      });
      await this.writeLedger({
        paymentId,
        entryType: "settlement",
        amountPaise: 0,
        direction: "credit",
        reference: `settle:${paymentId}:${Date.now()}`,
      });
    },

    async recoverFailedWebhooks(limit = 25) {
      if (!options.prisma) {
        const failed = memoryWebhooks.filter((item) => item.status === "failed").slice(0, limit);
        for (const item of failed) {
          item.attempts += 1;
          item.status = "requeued";
          await options.queue.enqueue("payment.reconcile", {
            paymentId: item.providerReference ?? item.idempotencyKey,
            provider: item.provider,
          });
        }
        return failed.length;
      }

      const failed = await options.prisma.webhookDelivery.findMany({
        where: { status: "failed", attempts: { lt: 8 } },
        take: limit,
        orderBy: { updatedAt: "asc" },
      });

      for (const item of failed) {
        await options.prisma.webhookDelivery.update({
          where: { id: item.id },
          data: {
            status: "requeued",
            attempts: { increment: 1 },
          },
        });
        await options.queue.enqueue("payment.reconcile", {
          paymentId: item.providerReference ?? item.idempotencyKey,
          provider: item.provider,
        });
      }
      incrementMetric("payments_webhook_recoveries_total", failed.length);
      return failed.length;
    },

    async enqueueReconciliation(paymentId, provider) {
      await options.queue.enqueue("payment.reconcile", { paymentId, provider });
    },
  };
}

export function recordMemoryWebhook(input: {
  idempotencyKey: string;
  provider: string;
  eventType: string;
  providerReference?: string;
  payload: unknown;
  status?: string;
}): void {
  memoryWebhooks.push({
    ...input,
    status: input.status ?? "received",
    attempts: 0,
  });
}
