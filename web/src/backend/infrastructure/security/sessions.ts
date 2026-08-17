import type { PrismaClient } from "@prisma/client";

import { writeImmutableAudit } from "@/backend/infrastructure/audit/audit-framework";

export interface SessionView {
  readonly id: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly deviceLabel?: string;
  readonly lastSeenAt: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly current: boolean;
}

export interface SessionService {
  listSessions(userId: string, currentSessionId?: string): Promise<readonly SessionView[]>;
  revokeSession(userId: string, sessionId: string): Promise<boolean>;
  revokeAllSessions(userId: string, exceptSessionId?: string): Promise<number>;
  touchSession(sessionId: string): Promise<void>;
}

interface MemorySession {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  deviceLabel?: string;
  lastSeenAt: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export function createMemorySessionService(
  seed: Map<string, MemorySession> = new Map(),
): SessionService & { upsert(session: MemorySession): void } {
  return {
    upsert(session) {
      seed.set(session.id, session);
    },
    async listSessions(userId, currentSessionId) {
      return [...seed.values()]
        .filter((session) => session.userId === userId && !session.revokedAt)
        .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
        .map((session) => ({
          id: session.id,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          deviceLabel: session.deviceLabel,
          lastSeenAt: session.lastSeenAt,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          current: session.id === currentSessionId,
        }));
    },
    async revokeSession(userId, sessionId) {
      const session = seed.get(sessionId);
      if (!session || session.userId !== userId || session.revokedAt) return false;
      session.revokedAt = new Date().toISOString();
      await writeImmutableAudit(undefined, {
        actorUserId: userId,
        action: "session.revoke",
        resource: "session",
        resourceId: sessionId,
      });
      return true;
    },
    async revokeAllSessions(userId, exceptSessionId) {
      let count = 0;
      for (const session of seed.values()) {
        if (
          session.userId === userId &&
          !session.revokedAt &&
          session.id !== exceptSessionId
        ) {
          session.revokedAt = new Date().toISOString();
          count += 1;
        }
      }
      await writeImmutableAudit(undefined, {
        actorUserId: userId,
        action: "session.revoke_all",
        resource: "user",
        resourceId: userId,
        metadata: { count, exceptSessionId },
      });
      return count;
    },
    async touchSession(sessionId) {
      const session = seed.get(sessionId);
      if (session && !session.revokedAt) {
        session.lastSeenAt = new Date().toISOString();
      }
    },
  };
}

export function createPrismaSessionService(prisma: PrismaClient): SessionService {
  return {
    async listSessions(userId, currentSessionId) {
      const sessions = await prisma.session.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { lastSeenAt: "desc" },
      });
      return sessions.map((session) => ({
        id: session.id,
        userAgent: session.userAgent ?? undefined,
        ipAddress: session.ipAddress ?? undefined,
        deviceLabel: session.deviceLabel ?? undefined,
        lastSeenAt: session.lastSeenAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        current: session.id === currentSessionId,
      }));
    },

    async revokeSession(userId, sessionId) {
      const result = await prisma.session.updateMany({
        where: { id: sessionId, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (result.count > 0) {
        await writeImmutableAudit(prisma, {
          actorUserId: userId,
          action: "session.revoke",
          resource: "session",
          resourceId: sessionId,
        });
      }
      return result.count > 0;
    },

    async revokeAllSessions(userId, exceptSessionId) {
      const result = await prisma.session.updateMany({
        where: {
          userId,
          revokedAt: null,
          ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
        },
        data: { revokedAt: new Date() },
      });
      await writeImmutableAudit(prisma, {
        actorUserId: userId,
        action: "session.revoke_all",
        resource: "user",
        resourceId: userId,
        metadata: { count: result.count, exceptSessionId },
      });
      return result.count;
    },

    async touchSession(sessionId) {
      await prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { lastSeenAt: new Date() },
      });
    },
  };
}
