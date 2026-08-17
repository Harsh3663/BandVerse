import type { PrismaClient } from "@prisma/client";

import { writeImmutableAudit } from "@/backend/infrastructure/audit/audit-framework";
import { logger } from "@/backend/infrastructure/observability/logger";

export interface RetentionPolicy {
  readonly resource: string;
  readonly softDeleteAfterDays?: number;
  readonly archiveAfterDays?: number;
  readonly hardDeleteAfterDays?: number;
}

export const defaultRetentionPolicies: readonly RetentionPolicy[] = [
  { resource: "session", hardDeleteAfterDays: 90 },
  { resource: "notification", hardDeleteAfterDays: 180 },
  { resource: "audit_log", archiveAfterDays: 365, hardDeleteAfterDays: 2555 },
  { resource: "webhook_delivery", hardDeleteAfterDays: 365 },
  { resource: "user", softDeleteAfterDays: 30, hardDeleteAfterDays: 90 },
];

export interface RetentionService {
  listPolicies(): readonly RetentionPolicy[];
  runSoftDeleteSweep(now?: Date): Promise<number>;
  requestGdprErasure(userId: string): Promise<{ status: "scheduled" | "completed" }>;
}

export function createRetentionService(prisma?: PrismaClient): RetentionService {
  return {
    listPolicies() {
      return defaultRetentionPolicies;
    },

    async runSoftDeleteSweep(now = new Date()) {
      if (!prisma) {
        logger.info("Retention sweep skipped (no prisma)");
        return 0;
      }
      let affected = 0;
      const sessionCutoff = new Date(now);
      sessionCutoff.setDate(sessionCutoff.getDate() - 90);
      const sessions = await prisma.session.deleteMany({
        where: {
          OR: [
            { revokedAt: { lt: sessionCutoff } },
            { expiresAt: { lt: sessionCutoff } },
          ],
        },
      });
      affected += sessions.count;

      const notificationCutoff = new Date(now);
      notificationCutoff.setDate(notificationCutoff.getDate() - 180);
      const notifications = await prisma.notification.deleteMany({
        where: { createdAt: { lt: notificationCutoff }, status: "read" },
      });
      affected += notifications.count;
      return affected;
    },

    async requestGdprErasure(userId) {
      await writeImmutableAudit(prisma, {
        actorUserId: userId,
        action: "gdpr.erasure_requested",
        resource: "user",
        resourceId: userId,
      });

      if (!prisma) {
        return { status: "scheduled" };
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          email: `erased+${userId}@bandverse.invalid`,
          phone: null,
          displayName: "Deleted User",
          avatarUrl: null,
          passwordHash: null,
          mfaEnabled: false,
          mfaSecretEncrypted: null,
          deletedAt: new Date(),
          anonymizedAt: new Date(),
          status: "deleted",
        },
      });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.mfaBackupCode.deleteMany({ where: { userId } });
      await prisma.trustedDevice.deleteMany({ where: { userId } });
      await prisma.notification.deleteMany({ where: { userId } });

      // Anonymize audit actor references (keep event for compliance chain).
      await prisma.auditLog.updateMany({
        where: { actorUserId: userId },
        data: {
          actorUserId: null,
          ipAddress: null,
          userAgent: null,
          metadataJson: { anonymized: true },
        },
      });

      try {
        await prisma.ledgerEntry.updateMany({
          where: {
            metadataJson: { path: ["userId"], equals: userId },
          },
          data: {
            metadataJson: { anonymizedUserId: true },
          },
        });
      } catch {
        // JSON path filters vary by provider; amounts remain for legal retention.
      }

      await writeImmutableAudit(prisma, {
        action: "gdpr.erasure_completed",
        resource: "user",
        resourceId: userId,
        after: {
          anonymized: true,
          sessionsDeleted: true,
          mfaDeleted: true,
          notificationsDeleted: true,
        },
      });
      return { status: "completed" };
    },
  };
}
