import { createHash } from "node:crypto";

import type { PrismaClient } from "@prisma/client";

import { getTraceContext } from "@/backend/infrastructure/observability/tracing";
import { logger } from "@/backend/infrastructure/observability/logger";
import { incrementMetric } from "@/backend/infrastructure/observability/metrics";

export interface AuditEvent {
  readonly id?: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly resource: string;
  readonly resourceId?: string;
  readonly timestamp?: string;
  readonly correlationId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly before?: Record<string, unknown>;
  readonly after?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

function computeImmutableHash(event: AuditEvent): string {
  const canonical = JSON.stringify({
    actorUserId: event.actorUserId ?? null,
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId ?? null,
    before: event.before ?? null,
    after: event.after ?? null,
    correlationId: event.correlationId ?? null,
    timestamp: event.timestamp ?? null,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Immutable audit writer — append-only, hashed payload, correlation-aware.
 * Never updates/deletes audit rows from application code.
 */
export async function writeImmutableAudit(
  prisma: PrismaClient | undefined,
  event: AuditEvent,
): Promise<void> {
  const trace = getTraceContext();
  const enriched: AuditEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
    correlationId: event.correlationId ?? trace?.correlationId ?? trace?.requestId,
  };
  const immutableHash = computeImmutableHash(enriched);

  logger.info("audit.immutable", {
    ...enriched,
    immutableHash,
  });
  incrementMetric("audit_events_total");

  if (!prisma) return;

  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: enriched.actorUserId,
        action: enriched.action,
        resource: enriched.resource,
        resourceId: enriched.resourceId,
        ipAddress: enriched.ipAddress,
        userAgent: enriched.userAgent,
        correlationId: enriched.correlationId,
        beforeJson: enriched.before as object | undefined,
        afterJson: enriched.after as object | undefined,
        metadataJson: enriched.metadata as object | undefined,
        immutableHash,
      },
    });
  } catch (error) {
    logger.warn("Failed to persist immutable audit event", {
      action: enriched.action,
      resource: enriched.resource,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Back-compat wrapper used by existing call sites. */
export async function writeAuditLog(
  prisma: PrismaClient | undefined,
  event: AuditEvent,
): Promise<void> {
  await writeImmutableAudit(prisma, event);
}
