import { createHash, randomBytes } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import type { PrismaClient } from "@prisma/client";

import type {
  AuthService,
  AuthTokenBundle,
  AuthUserView,
  LoginResult,
} from "@/backend/application/ports/services";
import { RoleName } from "@/backend/domain/enums";
import { conflictError, unauthorizedError } from "@/backend/shared/errors";
import { permissionsForRoles } from "./rbac";
import { hashPassword, verifyPassword } from "./password";
import { fromPrismaRoleName, toPrismaRoleName } from "../persistence/prisma/status-maps";

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
const MFA_CHALLENGE_TTL_SECONDS = 5 * 60;

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "bandverse-dev-only-secret-change-me";
  return new TextEncoder().encode(secret);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function toUserView(
  user: {
    id: string;
    email: string;
    displayName: string;
    phone: string | null;
    avatarUrl: string | null;
  },
  roles: readonly RoleName[],
): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roles,
    phone: user.phone ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

async function issueMfaChallenge(
  userId: string,
  email: string,
  displayName: string,
): Promise<Extract<LoginResult, { status: "mfa_required" }>> {
  const now = Math.floor(Date.now() / 1000);
  const mfaChallengeToken = await new SignJWT({ typ: "mfa_challenge" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + MFA_CHALLENGE_TTL_SECONDS)
    .setIssuer("bandverse")
    .setAudience("bandverse-api")
    .sign(getJwtSecret());
  return {
    status: "mfa_required",
    mfaChallengeToken,
    expiresIn: MFA_CHALLENGE_TTL_SECONDS,
    user: { id: userId, email, displayName },
  };
}

async function verifyMfaChallenge(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: "bandverse",
    audience: "bandverse-api",
  });
  if (payload.typ !== "mfa_challenge" || typeof payload.sub !== "string") {
    throw unauthorizedError("Invalid MFA challenge.");
  }
  return payload.sub;
}

async function issueTokens(
  prisma: PrismaClient,
  user: {
    id: string;
    email: string;
    displayName: string;
    phone: string | null;
    avatarUrl: string | null;
  },
  roles: readonly RoleName[],
  meta?: { userAgent?: string; ipAddress?: string },
): Promise<AuthTokenBundle> {
  const now = Math.floor(Date.now() / 1000);
  const sessionId = randomBytes(16).toString("hex");
  const refreshToken = randomBytes(48).toString("base64url");

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt: new Date((now + REFRESH_TTL_SECONDS) * 1000),
    },
  });

  const accessToken = await new SignJWT({
    roles,
    sid: sessionId,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TTL_SECONDS)
    .setIssuer("bandverse")
    .setAudience("bandverse-api")
    .sign(getJwtSecret());

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TTL_SECONDS,
    context: {
      userId: user.id,
      sessionId,
      roles,
      permissions: permissionsForRoles(roles),
    },
    user: toUserView(user, roles),
  };
}

async function ensureRole(prisma: PrismaClient, role: RoleName) {
  const name = toPrismaRoleName(role);
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: {
      name,
      description: `${role} role`,
    },
  });
}

export function createPrismaAuthService(prisma: PrismaClient): AuthService {
  return {
    async register(input) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (existing) throw conflictError("An account with this email already exists.");

      const passwordHash = await hashPassword(input.password);
      const role = await ensureRole(prisma, input.role);
      const userRole = await ensureRole(prisma, RoleName.USER);

      const user = await prisma.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          displayName: input.displayName,
          phone: input.phone,
          status: "active",
          roles: {
            create: [
              { roleId: role.id },
              ...(role.id === userRole.id ? [] : [{ roleId: userRole.id }]),
            ],
          },
          ...(input.role === RoleName.PERFORMER
            ? {
                performer: {
                  create: {
                    handle: `user-${randomBytes(4).toString("hex")}`,
                    kind: "solo",
                    displayName: input.displayName,
                    headline: "New BandVerse performer",
                    biography: "",
                    city: "Mumbai",
                    state: "Maharashtra",
                    profileJson: {
                      id: "pending",
                      handle: "pending",
                      kind: "solo",
                      displayName: input.displayName,
                      headline: "New BandVerse performer",
                      biography: "",
                      travel: {
                        baseLocation: {
                          city: "Mumbai",
                          state: "Maharashtra",
                          countryCode: "IN",
                        },
                        radiusKm: 50,
                        nationwide: false,
                      },
                      rating: { average: 0, count: 0 },
                    },
                  },
                },
              }
            : {}),
          ...(input.role === RoleName.ORGANIZER
            ? {
                organizer: {
                  create: {
                    displayName: input.displayName,
                    hostId: `host_${randomBytes(6).toString("hex")}`,
                  },
                },
              }
            : {}),
        },
        include: { roles: { include: { role: true } } },
      });

      const roles = user.roles.map((entry) => fromPrismaRoleName(entry.role.name));
      return issueTokens(prisma, user, roles);
    },

    async login(email, password) {
      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase(), deletedAt: null },
        include: { roles: { include: { role: true } } },
      });
      if (!user?.passwordHash) throw unauthorizedError("Invalid credentials.");

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) throw unauthorizedError("Invalid credentials.");
      if (user.status === "suspended" || user.status === "deleted") {
        throw unauthorizedError("Account is not active.");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      if (user.mfaEnabled) {
        return issueMfaChallenge(user.id, user.email, user.displayName);
      }

      const roles = user.roles.map((entry) => fromPrismaRoleName(entry.role.name));
      const bundle = await issueTokens(
        prisma,
        user,
        roles.length ? roles : [RoleName.USER],
      );
      return { status: "authenticated" as const, ...bundle };
    },

    async completeMfaLogin(mfaChallengeToken) {
      const userId = await verifyMfaChallenge(mfaChallengeToken);
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null, mfaEnabled: true },
        include: { roles: { include: { role: true } } },
      });
      if (!user) throw unauthorizedError("Invalid MFA challenge.");
      const roles = user.roles.map((entry) => fromPrismaRoleName(entry.role.name));
      return issueTokens(prisma, user, roles.length ? roles : [RoleName.USER]);
    },

    async refresh(refreshToken) {
      const tokenHash = hashToken(refreshToken);
      const nextRefresh = randomBytes(48).toString("base64url");
      const nextHash = hashToken(nextRefresh);
      const now = Math.floor(Date.now() / 1000);

      const rotated = await prisma.session.updateMany({
        where: {
          refreshTokenHash: tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          refreshTokenHash: nextHash,
          expiresAt: new Date((now + REFRESH_TTL_SECONDS) * 1000),
          lastSeenAt: new Date(),
        },
      });

      if (rotated.count === 0) {
        const reuse = await prisma.session.findFirst({
          where: { refreshTokenHash: tokenHash },
        });
        if (reuse) {
          await prisma.session.updateMany({
            where: { userId: reuse.userId, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        }
        throw unauthorizedError("Invalid refresh token.");
      }

      const session = await prisma.session.findFirst({
        where: { refreshTokenHash: nextHash, revokedAt: null },
        include: {
          user: { include: { roles: { include: { role: true } } } },
        },
      });
      if (!session) throw unauthorizedError("Invalid refresh token.");

      const roles = session.user.roles.map((entry) =>
        fromPrismaRoleName(entry.role.name),
      );
      const accessToken = await new SignJWT({
        roles,
        sid: session.id,
        typ: "access",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(session.userId)
        .setIssuedAt(now)
        .setExpirationTime(now + ACCESS_TTL_SECONDS)
        .setIssuer("bandverse")
        .setAudience("bandverse-api")
        .sign(getJwtSecret());

      return {
        accessToken,
        refreshToken: nextRefresh,
        expiresIn: ACCESS_TTL_SECONDS,
      };
    },

    async logout(sessionId) {
      await prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    },

    async revokeAllSessions(userId) {
      const result = await prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return result.count;
    },

    async getContextFromAccessToken(token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecret(), {
          issuer: "bandverse",
          audience: "bandverse-api",
        });
        if (payload.typ !== "access" || typeof payload.sub !== "string") {
          return undefined;
        }
        const sessionId =
          typeof payload.sid === "string" ? payload.sid : undefined;
        if (sessionId) {
          const session = await prisma.session.findFirst({
            where: {
              id: sessionId,
              userId: payload.sub,
              revokedAt: null,
              expiresAt: { gt: new Date() },
            },
          });
          if (!session) return undefined;
        }
        const roles = Array.isArray(payload.roles)
          ? (payload.roles as RoleName[])
          : [RoleName.USER];
        return {
          userId: payload.sub,
          sessionId,
          roles,
          permissions: permissionsForRoles(roles),
        };
      } catch {
        return undefined;
      }
    },

    async getMe(userId) {
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { roles: { include: { role: true } } },
      });
      if (!user) return undefined;
      const roles = user.roles.map((entry) => fromPrismaRoleName(entry.role.name));
      return toUserView(user, roles);
    },
  };
}

/** Dev/fallback auth when DATABASE_URL is unset. Still uses bcrypt + jose. */
export function createMemoryAuthService(options?: {
  onSessionCreated?: (session: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
  }) => void;
  isMfaEnabled?: (userId: string) => Promise<boolean>;
}): AuthService {
  type MemUser = {
    id: string;
    email: string;
    displayName: string;
    phone: string | null;
    avatarUrl: string | null;
    passwordHash: string;
    roles: RoleName[];
  };
  const users = new Map<string, MemUser>();
  const sessions = new Map<
    string,
    { userId: string; refreshTokenHash: string; revoked: boolean; expiresAt: number }
  >();

  async function issue(user: MemUser): Promise<AuthTokenBundle> {
    const now = Math.floor(Date.now() / 1000);
    const sessionId = randomBytes(16).toString("hex");
    const refreshToken = randomBytes(48).toString("base64url");
    sessions.set(sessionId, {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      revoked: false,
      expiresAt: now + REFRESH_TTL_SECONDS,
    });
    const accessToken = await new SignJWT({
      roles: user.roles,
      sid: sessionId,
      typ: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuedAt(now)
      .setExpirationTime(now + ACCESS_TTL_SECONDS)
      .setIssuer("bandverse")
      .setAudience("bandverse-api")
      .sign(getJwtSecret());

    options?.onSessionCreated?.({
      id: sessionId,
      userId: user.id,
      createdAt: new Date(now * 1000).toISOString(),
      expiresAt: new Date((now + REFRESH_TTL_SECONDS) * 1000).toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TTL_SECONDS,
      context: {
        userId: user.id,
        sessionId,
        roles: user.roles,
        permissions: permissionsForRoles(user.roles),
      },
      user: toUserView(user, user.roles),
    };
  }

  return {
    async register(input) {
      const email = input.email.toLowerCase();
      if ([...users.values()].some((user) => user.email === email)) {
        throw conflictError("An account with this email already exists.");
      }
      const user: MemUser = {
        id: `user_${randomBytes(6).toString("hex")}`,
        email,
        displayName: input.displayName,
        phone: input.phone ?? null,
        avatarUrl: null,
        passwordHash: await hashPassword(input.password),
        roles: [input.role, RoleName.USER],
      };
      users.set(user.id, user);
      return issue(user);
    },
    async login(email, password) {
      const user = [...users.values()].find(
        (entry) => entry.email === email.toLowerCase(),
      );
      if (!user || !(await verifyPassword(password, user.passwordHash))) {
        throw unauthorizedError("Invalid credentials.");
      }
      if (options?.isMfaEnabled && (await options.isMfaEnabled(user.id))) {
        return issueMfaChallenge(user.id, user.email, user.displayName);
      }
      const bundle = await issue(user);
      return { status: "authenticated" as const, ...bundle };
    },
    async completeMfaLogin(mfaChallengeToken) {
      const userId = await verifyMfaChallenge(mfaChallengeToken);
      const user = users.get(userId);
      if (!user) throw unauthorizedError("Invalid MFA challenge.");
      if (options?.isMfaEnabled && !(await options.isMfaEnabled(userId))) {
        throw unauthorizedError("Invalid MFA challenge.");
      }
      return issue(user);
    },
    async refresh(refreshToken) {
      const tokenHash = hashToken(refreshToken);
      const sessionEntry = [...sessions.entries()].find(
        ([, session]) =>
          session.refreshTokenHash === tokenHash &&
          !session.revoked &&
          session.expiresAt > Math.floor(Date.now() / 1000),
      );
      if (!sessionEntry) {
        const reuse = [...sessions.entries()].find(
          ([, session]) => session.refreshTokenHash === tokenHash,
        );
        if (reuse) {
          for (const [id, session] of sessions.entries()) {
            if (session.userId === reuse[1].userId) {
              sessions.set(id, { ...session, revoked: true });
            }
          }
        }
        throw unauthorizedError("Invalid refresh token.");
      }
      const [sessionId, session] = sessionEntry;
      const user = users.get(session.userId);
      if (!user) throw unauthorizedError("Invalid refresh token.");
      const nextRefresh = randomBytes(48).toString("base64url");
      sessions.set(sessionId, {
        ...session,
        refreshTokenHash: hashToken(nextRefresh),
        expiresAt: Math.floor(Date.now() / 1000) + REFRESH_TTL_SECONDS,
      });
      const now = Math.floor(Date.now() / 1000);
      const accessToken = await new SignJWT({
        roles: user.roles,
        sid: sessionId,
        typ: "access",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.id)
        .setIssuedAt(now)
        .setExpirationTime(now + ACCESS_TTL_SECONDS)
        .setIssuer("bandverse")
        .setAudience("bandverse-api")
        .sign(getJwtSecret());
      return {
        accessToken,
        refreshToken: nextRefresh,
        expiresIn: ACCESS_TTL_SECONDS,
      };
    },
    async logout(sessionId) {
      const session = sessions.get(sessionId);
      if (session) sessions.set(sessionId, { ...session, revoked: true });
    },
    async revokeAllSessions(userId) {
      let count = 0;
      for (const [sessionId, session] of sessions.entries()) {
        if (session.userId === userId && !session.revoked) {
          sessions.set(sessionId, { ...session, revoked: true });
          count += 1;
        }
      }
      return count;
    },
    async getContextFromAccessToken(token) {
      try {
        const { payload } = await jwtVerify(token, getJwtSecret(), {
          issuer: "bandverse",
          audience: "bandverse-api",
        });
        if (payload.typ !== "access" || typeof payload.sub !== "string") {
          return undefined;
        }
        const sessionId =
          typeof payload.sid === "string" ? payload.sid : undefined;
        if (sessionId) {
          const session = sessions.get(sessionId);
          if (
            !session ||
            session.revoked ||
            session.userId !== payload.sub ||
            session.expiresAt <= Math.floor(Date.now() / 1000)
          ) {
            return undefined;
          }
        }
        const roles = Array.isArray(payload.roles)
          ? (payload.roles as RoleName[])
          : [RoleName.USER];
        return {
          userId: payload.sub,
          sessionId,
          roles,
          permissions: permissionsForRoles(roles),
        };
      } catch {
        return undefined;
      }
    },
    async getMe(userId) {
      const user = users.get(userId);
      return user ? toUserView(user, user.roles) : undefined;
    },
  };
}

export const authTokenTtl = {
  accessTtlSeconds: ACCESS_TTL_SECONDS,
  refreshTtlSeconds: REFRESH_TTL_SECONDS,
  mfaChallengeTtlSeconds: MFA_CHALLENGE_TTL_SECONDS,
} as const;
